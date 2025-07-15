const magic = require('mmmagic');
const magicChecker = new magic.Magic(magic.MAGIC_MIME_TYPE);

const validateFile = (file) => new Promise((resolve) => {
  magicChecker.detectFile(file.path, (err, result) => {
    if (err) return resolve(false);
    resolve(config.ALLOWED_TYPES.includes(result));
  });
});