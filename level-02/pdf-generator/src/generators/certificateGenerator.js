
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pdfConfig = require('../config/pdfConfig');
const logger = require('../utils/logger');

class CertificateGenerator {
  static async generate(certificateData, outputPath = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const fileName = `certificate_${certificateData.name || 'recipient'}.pdf`;
        const filePath = outputPath || path.join(pdfConfig.storagePath, fileName);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add certificate header
        this._addHeader(doc, certificateData);

        // Add recipient info
        this._addRecipientInfo(doc, certificateData);

        // Add certificate body
        this._addBody(doc, certificateData);

        // Add footer
        this._addFooter(doc, certificateData);

        doc.end();

        writeStream.on('finish', () => {
          logger.info(`Certificate generated: ${filePath}`);
          resolve({
            path: filePath,
            fileName,
            size: fs.statSync(filePath).size,
          });
        });

        writeStream.on('error', (err) => {
          logger.error('Error generating certificate:', err);
          reject(err);
        });
      } catch (error) {
        logger.error('Certificate generation failed:', error);
        reject(error);
      }
    });
  }

  static _addHeader(doc, data) {
    doc
      .font(pdfConfig.fonts.bold)
      .fontSize(28)
      .text('Certificate of Achievement', { align: 'center' })
      .moveDown(2);
  }

  static _addRecipientInfo(doc, data) {
    doc
      .font(pdfConfig.fonts.regular)
      .fontSize(16)
      .text(`This is to certify that`, { align: 'center' })
      .moveDown(1)
      .font(pdfConfig.fonts.bold)
      .fontSize(22)
      .text(data.name || 'Recipient Name', { align: 'center' })
      .moveDown(1);
  }

  static _addBody(doc, data) {
    doc
      .font(pdfConfig.fonts.regular)
      .fontSize(16)
      .text(data.description || 'For outstanding performance and dedication.', {
        align: 'center',
      })
      .moveDown(2);

    if (data.date) {
      doc
        .font(pdfConfig.fonts.regular)
        .fontSize(12)
        .text(`Date: ${new Date(data.date).toLocaleDateString()}`, { align: 'center' })
        .moveDown(1);
    }
    if (data.issuer) {
      doc
        .font(pdfConfig.fonts.bold)
        .fontSize(14)
        .text(`Issued by: ${data.issuer}`, { align: 'center' })
        .moveDown(2);
    }
  }

  static _addFooter(doc, data) {
    doc
      .font(pdfConfig.fonts.italic || pdfConfig.fonts.regular)
      .fontSize(10)
      .text(data.footerNote || 'Congratulations!', { align: 'center' });
  }
}

module.exports = CertificateGenerator;
