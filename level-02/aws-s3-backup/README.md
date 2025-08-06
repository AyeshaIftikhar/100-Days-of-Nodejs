# AWS S3 Automated Backup System

This Node.js application provides automated backup functionality to AWS S3 with retention policy management.

## Features

- Scheduled backups to AWS S3
- Zip compression before upload
- Retention policy for old backups
- Comprehensive logging
- Configurable via environment variables

## Prerequisites

- Node.js 14.x or higher
- AWS account with S3 access
- AWS IAM user with S3 permissions

## Configuration

Environment variables in .env:

- AWS_ACCESS_KEY_ID: Your AWS access key
- AWS_SECRET_ACCESS_KEY: Your AWS secret key
- AWS_REGION: AWS region for S3 bucket
- AWS_S3_BUCKET: S3 bucket name for backups
- BACKUP_SOURCE_DIR: Local directory to back up
- BACKUP_PREFIX: Prefix for backup filenames
- BACKUP_RETENTION_DAYS: Number of days to keep backups
- CRON_SCHEDULE: Cron schedule for automatic backups (default: daily at 2 AM)

## Future Enhancements

1. Multi-part uploads: Support for large files with AWS S3 multi-part upload
2. Database backups: Direct integration with databases (MySQL, MongoDB, etc.)
3. Notification system: Email/SMS notifications for backup success/failure
4. Encryption: Support for client-side encryption before upload
5. Restore functionality: CLI to restore backups from S3
6. Health checks: Monitoring endpoint for backup service
7. Multiple backup sources: Support for backing up multiple directories
8. CloudWatch integration: Detailed metrics and monitoring
9. Cross-account backups: Support for backing up to different AWS accounts
10. Docker support: Containerize the application for easier deployment
