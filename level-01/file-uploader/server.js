const app = require('./app');
const config = require('./config/upload');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`File uploader running on port ${port}`);
  console.log(`Upload directory: ${config.UPLOAD_DIR}`);
  console.log(`API endpoints:`);
  console.log(`- POST /api/upload/single`);
  console.log(`- POST /api/upload/multiple`);
  console.log(`- GET /api/upload/progress`);
  console.log(`- GET /api/upload/download/:filename`);
});