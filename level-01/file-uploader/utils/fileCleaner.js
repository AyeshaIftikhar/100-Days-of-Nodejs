const fs = require('fs');
const path = require('path');
const config = require('../config/upload');

// Cleanup files older than 24 hours
function cleanOldFiles() {
  fs.readdir(config.UPLOAD_DIR, (err, files) => {
    if (err) return;
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(config.UPLOAD_DIR, file);
      fs.stat(filePath, (err, stat) => {
        if (err) return;
        
        if (now - stat.mtimeMs > oneDay) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
}

// Run cleanup every hour
setInterval(cleanOldFiles, 60 * 60 * 1000);

module.exports = cleanOldFiles;