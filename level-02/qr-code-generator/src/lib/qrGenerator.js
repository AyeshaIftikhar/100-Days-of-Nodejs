const QRCode = require('qrcode');
const sharp = require('sharp');
const logger = require('../utils/logger');

class QRGenerator {
  constructor() {
    this.defaultOptions = {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 200
    };
  }

  async generate(text, options = {}) {
    try {
      const mergedOptions = { ...this.defaultOptions, ...options };
      const qrCodeDataURL = await QRCode.toDataURL(text, mergedOptions);
      
      // Convert to Buffer for further processing
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      let buffer = Buffer.from(base64Data, 'base64');
      
      // Apply additional image processing if needed
      if (mergedOptions.resize) {
        buffer = await sharp(buffer)
          .resize(mergedOptions.resize.width, mergedOptions.resize.height)
          .toBuffer();
      }
      
      return buffer;
    } catch (error) {
      logger.error(`QR generation failed: ${error.message}`);
      throw new Error('Failed to generate QR code');
    }
  }

  async generateWithLogo(text, logoPath, options = {}) {
    try {
      const qrBuffer = await this.generate(text, options);
      const logo = await sharp(logoPath)
        .resize(options.logoSize || 40, options.logoSize || 40)
        .toBuffer();
      
      return sharp(qrBuffer)
        .composite([{ input: logo, gravity: 'center' }])
        .toBuffer();
    } catch (error) {
      logger.error(`QR with logo generation failed: ${error.message}`);
      throw new Error('Failed to generate QR code with logo');
    }
  }
}

module.exports = new QRGenerator();