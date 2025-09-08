const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const benchmarkController = require('../controllers/benchmarkController');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `benchmark-${uuidv4()}${fileExt}`;
    cb(null, uniqueFilename);
  }
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

/**
 * @swagger
 * /api/benchmark:
 *   post:
 *     summary: Run a performance benchmark comparing WebAssembly vs JavaScript
 *     description: Upload an image and run performance benchmarks on various operations
 *     tags: [Benchmark]
 *     parameters:
 *       - in: query
 *         name: iterations
 *         schema:
 *           type: integer
 *         description: Number of iterations to run (default 5, max 20)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to use for benchmarking
 *     responses:
 *       200:
 *         description: Benchmark completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 iterations:
 *                   type: integer
 *                 benchmarkResults:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('image'), benchmarkController.runBenchmark);

module.exports = router;
