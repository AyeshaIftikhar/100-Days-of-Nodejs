const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('your-bucket-name');

const cloudStorage = multer.memoryStorage();
const upload = multer({ storage: cloudStorage });

router.post('/cloud', upload.single('file'), async (req, res) => {
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();
  
  blobStream.on('error', err => {
    res.status(500).json({ error: err.message });
  });
  
  blobStream.on('finish', () => {
    res.json({ message: 'File uploaded to cloud' });
  });
  
  blobStream.end(req.file.buffer);
});