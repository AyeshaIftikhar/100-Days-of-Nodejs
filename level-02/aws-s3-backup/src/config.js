require('dotenv').config();

module.exports = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3Bucket: process.env.AWS_S3_BUCKET
  },
  backup: {
    sourceDir: process.env.BACKUP_SOURCE_DIR,
    prefix: process.env.BACKUP_PREFIX,
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
  },
  schedule: process.env.CRON_SCHEDULE || '0 2 * * *' // Default: daily at 2 AM
};