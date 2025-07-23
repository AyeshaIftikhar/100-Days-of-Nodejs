const transporter = require('../config/email');
const { compileTemplate } = require('./templateService');
const SentEmail = require('../models/SentEmail');
const logger = require('../utils/logger');

class EmailService {
  static async sendEmail({ to, subject, template, context, scheduled = null }) {
    try {
      // Compile email template
      const { html, text } = await compileTemplate(template, context);

      // Email options
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      // Log sent email
      await SentEmail.create({
        messageId: info.messageId,
        to,
        subject,
        template,
        context,
        scheduled,
        status: 'sent',
      });

      logger.info(`Email sent to ${to} with message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      
      // Log failed attempt
      await SentEmail.create({
        to,
        subject,
        template,
        context,
        scheduled,
        status: 'failed',
        error: error.message,
      });

      throw error;
    }
  }

  static async sendBulk(emails) {
    const results = [];
    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = EmailService;