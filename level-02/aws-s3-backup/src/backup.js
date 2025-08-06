const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const fsExtra = require('fs-extra');
const config = require('./config');
const logger = require('./utils/logger');

class BackupManager {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${config.backup.prefix}-${timestamp}.zip`;
      const backupPath = path.join(__dirname, '..', 'temp', backupName);
      
      // Ensure temp directory exists
      await fsExtra.ensureDir(path.join(__dirname, '..', 'temp'));
      
      // Create zip archive
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        logger.info(`Archive created: ${archive.pointer()} total bytes`);
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);
      archive.directory(config.backup.sourceDir, false);
      await archive.finalize();

      // Upload to S3
      const fileContent = fs.readFileSync(backupPath);
      const params = {
        Bucket: config.aws.s3Bucket,
        Key: `backups/${backupName}`,
        Body: fileContent
      };

      const uploadResult = await this.s3.upload(params).promise();
      logger.info(`Backup uploaded successfully: ${uploadResult.Location}`);

      // Clean up local zip file
      fs.unlinkSync(backupPath);

      return uploadResult;
    } catch (error) {
      logger.error(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  async cleanupOldBackups() {
    try {
      const listParams = {
        Bucket: config.aws.s3Bucket,
        Prefix: 'backups/'
      };

      const listedObjects = await this.s3.listObjectsV2(listParams).promise();
      
      if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.backup.retentionDays);

      const objectsToDelete = listedObjects.Contents.filter(obj => {
        return new Date(obj.LastModified) < cutoffDate;
      }).map(obj => ({ Key: obj.Key }));

      if (objectsToDelete.length === 0) {
        logger.info('No old backups to delete');
        return;
      }

      const deleteParams = {
        Bucket: config.aws.s3Bucket,
        Delete: { Objects: objectsToDelete }
      };

      const deleteResult = await this.s3.deleteObjects(deleteParams).promise();
      logger.info(`Deleted ${deleteResult.Deleted.length} old backups`);

      return deleteResult;
    } catch (error) {
      logger.error(`Cleanup failed: ${error.message}`);
      throw error;
    }
  }
}

// If run directly (not required as module)
if (require.main === module) {
  (async () => {
    try {
      const backupManager = new BackupManager();
      await backupManager.createBackup();
      await backupManager.cleanupOldBackups();
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  })();
}

module.exports = BackupManager;