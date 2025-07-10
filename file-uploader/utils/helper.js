function generateRandomString(length) {
  return [...Array(length)]
    .map(() => Math.random().toString(36)[2])
    .join('');
}

function getFileInfo(file) {
  return {
    originalName: file.originalname,
    fileName: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path
  };
}

module.exports = {
  generateRandomString,
  getFileInfo
};