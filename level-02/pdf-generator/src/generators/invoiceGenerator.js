const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pdfConfig = require('../config/pdfConfig');
const logger = require('../utils/logger');

class InvoiceGenerator {
  static async generate(invoiceData, outputPath = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const fileName = `invoice_${invoiceData.invoiceNumber}.pdf`;
        const filePath = outputPath || path.join(pdfConfig.storagePath, fileName);
        
        // Ensure directory exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add header
        this._addHeader(doc, invoiceData);

        // Add customer information
        this._addCustomerInfo(doc, invoiceData);

        // Add invoice items table
        this._addItemsTable(doc, invoiceData);

        // Add totals
        this._addTotals(doc, invoiceData);

        // Add footer
        this._addFooter(doc, invoiceData);

        doc.end();

        writeStream.on('finish', () => {
          logger.info(`Invoice generated: ${filePath}`);
          resolve({
            path: filePath,
            fileName,
            size: fs.statSync(filePath).size,
          });
        });

        writeStream.on('error', (err) => {
          logger.error('Error generating invoice:', err);
          reject(err);
        });
      } catch (error) {
        logger.error('Invoice generation failed:', error);
        reject(error);
      }
    });
  }

  static _addHeader(doc, data) {
    doc
      .font(pdfConfig.fonts.bold)
      .fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown(0.5);

    doc
      .font(pdfConfig.fonts.regular)
      .fontSize(12)
      .text(`Invoice #: ${data.invoiceNumber}`, { align: 'right' })
      .text(`Date: ${new Date(data.date).toLocaleDateString()}`, { align: 'right' })
      .moveDown(2);
  }

  static _addCustomerInfo(doc, data) {
    doc
      .font(pdfConfig.fonts.bold)
      .fontSize(14)
      .text('Bill To:', { continued: true })
      .font(pdfConfig.fonts.regular)
      .text(` ${data.customer.name}`)
      .font(pdfConfig.fonts.regular)
      .fontSize(12)
      .text(data.customer.address)
      .text(`${data.customer.city}, ${data.customer.state} ${data.customer.zip}`)
      .text(`Phone: ${data.customer.phone}`)
      .text(`Email: ${data.customer.email}`)
      .moveDown(2);
  }

  static _addItemsTable(doc, data) {
    const tableTop = doc.y;
    const itemWidth = 300;
    const quantityWidth = 50;
    const priceWidth = 100;
    const totalWidth = 100;

    // Table header
    doc
      .font(pdfConfig.fonts.bold)
      .fontSize(12)
      .text('Description', 50, tableTop)
      .text('Qty', 50 + itemWidth, tableTop)
      .text('Price', 50 + itemWidth + quantityWidth, tableTop)
      .text('Total', 50 + itemWidth + quantityWidth + priceWidth, tableTop)
      .moveDown(0.5);

    // Table rows
    let currentY = doc.y;
    data.items.forEach((item, index) => {
      doc
        .font(pdfConfig.fonts.regular)
        .fontSize(10)
        .text(item.description, 50, currentY, { width: itemWidth })
        .text(item.quantity.toString(), 50 + itemWidth, currentY, { width: quantityWidth })
        .text(`$${item.price.toFixed(2)}`, 50 + itemWidth + quantityWidth, currentY, { width: priceWidth })
        .text(`$${(item.quantity * item.price).toFixed(2)}`, 50 + itemWidth + quantityWidth + priceWidth, currentY, { width: totalWidth });

      currentY += 20;
    });

    doc.y = currentY + 10;
  }

  static _addTotals(doc, data) {
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * (data.taxRate || 0);
    const total = subtotal + tax;

    doc
      .font(pdfConfig.fonts.bold)
      .fontSize(12)
      .text('Subtotal:', 350, doc.y, { continued: true, align: 'right' })
      .font(pdfConfig.fonts.regular)
      .text(` $${subtotal.toFixed(2)}`, { align: 'right' });

    doc
      .font(pdfConfig.fonts.bold)
      .text(`Tax (${(data.taxRate * 100).toFixed(2)}%):`, { continued: true, align: 'right' })
      .font(pdfConfig.fonts.regular)
      .text(` $${tax.toFixed(2)}`, { align: 'right' });

    doc
      .font(pdfConfig.fonts.bold)
      .fontSize(14)
      .text('Total:', { continued: true, align: 'right' })
      .text(` $${total.toFixed(2)}`, { align: 'right' })
      .moveDown(2);
  }

  static _addFooter(doc, data) {
    doc
      .font(pdfConfig.fonts.regular)
      .fontSize(10)
      .text('Thank you for your business!', { align: 'center' })
      .text('Terms: Payment due within 30 days', { align: 'center' })
      .text(data.company.footerNote || '', { align: 'center' });
  }
}

module.exports = InvoiceGenerator;