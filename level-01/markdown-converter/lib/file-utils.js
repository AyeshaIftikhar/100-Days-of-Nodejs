const fs = require('fs').promises;
const path = require('path');

class FileUtils {
  static async findMarkdownFiles(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            return this.findMarkdownFiles(fullPath);
          } else if (entry.isFile() && path.extname(entry.name) === '.md') {
            return fullPath;
          }
          return null;
        })
      );
      return files.flat().filter(Boolean);
    } catch (error) {
      throw new Error(`Failed to scan directory: ${error.message}`);
    }
  }

  static async ensureDirectoryExists(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new Error(`Directory creation failed: ${error.message}`);
      }
    }
  }
}

module.exports = FileUtils;