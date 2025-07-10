const fs = require('fs');
const Base64Encoder = require('./encoder');

class FileHandler {
  static encodeFile(inputPath, outputPath, urlSafe = false) {
    return new Promise((resolve, reject) => {
      fs.readFile(inputPath, (err, data) => {
        if (err) return reject(err);
        
        const encoded = Base64Encoder.encode(data.toString(), urlSafe);
        
        if (outputPath) {
          fs.writeFile(outputPath, encoded, (err) => {
            if (err) return reject(err);
            resolve(`File encoded and saved to ${outputPath}`);
          });
        } else {
          resolve(encoded);
        }
      });
    });
  }

  static decodeFile(inputPath, outputPath, urlSafe = false) {
    return new Promise((resolve, reject) => {
      fs.readFile(inputPath, (err, data) => {
        if (err) return reject(err);
        
        const decoded = Base64Encoder.decode(data.toString(), urlSafe);
        
        if (outputPath) {
          fs.writeFile(outputPath, decoded, (err) => {
            if (err) return reject(err);
            resolve(`File decoded and saved to ${outputPath}`);
          });
        } else {
          resolve(decoded);
        }
      });
    });
  }
}

module.exports = FileHandler;