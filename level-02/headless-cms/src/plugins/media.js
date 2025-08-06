const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const uploadDir = path.join(__dirname, '../../public/uploads');

class MediaService {
  constructor() {
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirpSync(uploadDir);
    }
  }

  async upload(file) {
    if (!file) {
      throw new ValidationError('No file uploaded');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.move(file.path, filepath);

    return {
      url: `/uploads/${filename}`,
      filename,
      mimetype: file.mimetype,
      size: file.size
    };
  }

  async delete(fileUrl) {
    const filename = path.basename(fileUrl);
    const filepath = path.join(uploadDir, filename);

    if (await fs.pathExists(filepath)) {
      await fs.remove(filepath);
      return true;
    }
    return false;
  }
}

module.exports = new MediaService();