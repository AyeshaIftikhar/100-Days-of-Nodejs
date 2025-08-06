const BackupManager = require('../src/backup');
const AWS = require('aws-sdk-mock');
const fs = require('fs-extra');
const path = require('path');

jest.mock('fs-extra');
jest.mock('archiver');

describe('BackupManager', () => {
  let backupManager;

  beforeAll(() => {
    backupManager = new BackupManager();
  });

  afterEach(() => {
    AWS.restore();
    jest.clearAllMocks();
  });

  describe('createBackup', () => {
    it('should create and upload a backup successfully', async () => {
      const mockFileStream = {
        on: jest.fn().mockImplementation(function(event, callback) {
          if (event === 'close') callback();
          return this;
        }),
        write: jest.fn(),
        end: jest.fn()
      };

      fs.createWriteStream.mockReturnValue(mockFileStream);
      fs.readFileSync.mockReturnValue('mock file content');
      
      AWS.mock('S3', 'upload', (params, callback) => {
        callback(null, { Location: 'https://mock-location' });
      });

      const result = await backupManager.createBackup();
      
      expect(result.Location).toBe('https://mock-location');
      expect(fs.createWriteStream).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should handle errors during backup creation', async () => {
      fs.createWriteStream.mockImplementation(() => {
        throw new Error('File creation failed');
      });

      await expect(backupManager.createBackup()).rejects.toThrow('File creation failed');
    });
  });

  describe('cleanupOldBackups', () => {
    it('should delete old backups based on retention policy', async () => {
      const mockObjects = {
        Contents: [
          { 
            Key: 'backups/old-backup.zip',
            LastModified: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
          },
          {
            Key: 'backups/recent-backup.zip',
            LastModified: new Date() // today
          }
        ]
      };

      AWS.mock('S3', 'listObjectsV2', (params, callback) => {
        callback(null, mockObjects);
      });

      AWS.mock('S3', 'deleteObjects', (params, callback) => {
        callback(null, { Deleted: [{ Key: 'backups/old-backup.zip' }] });
      });

      const result = await backupManager.cleanupOldBackups();
      
      expect(result.Deleted.length).toBe(1);
      expect(result.Deleted[0].Key).toBe('backups/old-backup.zip');
    });

    it('should handle no backups to delete', async () => {
      AWS.mock('S3', 'listObjectsV2', (params, callback) => {
        callback(null, { Contents: [] });
      });

      const result = await backupManager.cleanupOldBackups();
      expect(result).toBeUndefined();
    });
  });
});