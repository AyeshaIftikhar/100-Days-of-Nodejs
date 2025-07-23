const SentEmail = require('../models/SentEmail');
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

class EmailJob {
  static async processScheduledEmails() {
    try {
      const now = new Date();
      const pendingEmails = await SentEmail.find({
        scheduled: { $lte: now },
        status: 'pending',
      }).limit(100); // Process 100 at a time

      if (pendingEmails.length === 0) {
        logger.info('No scheduled emails to process');
        return;
      }

      logger.info(`Processing ${pendingEmails.length} scheduled emails`);

      for (const email of pendingEmails) {
        try {
          await EmailService.sendEmail({
            to: email.to,
            subject: email.subject,
            template: email.template,
            context: email.context,
          });
        } catch (error) {
          logger.error(`Failed to process scheduled email ${email._id}: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error('Error processing scheduled emails:', error);
      throw error;
    }
  }

  static async cleanupOldRecords(days = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);

      const result = await SentEmail.deleteMany({
        createdAt: { $lt: date },
        status: { $in: ['sent', 'failed'] },
      });

      logger.info(`Cleaned up ${result.deletedCount} old email records`);
      return result;
    } catch (error) {
      logger.error('Error cleaning up old records:', error);
      throw error;
    }
  }
}

module.exports = EmailJob;