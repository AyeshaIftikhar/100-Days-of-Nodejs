const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const imageController = require('../controllers/imageController');

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
    const uniqueFilename = `${uuidv4()}${fileExt}`;
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
 * components:
 *   schemas:
 *     Operation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the operation
 *         description:
 *           type: string
 *           description: Description of what the operation does
 *         params:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               required:
 *                 type: boolean
 */

/**
 * @swagger
 * /api/images/operations:
 *   get:
 *     summary: Get all available image processing operations
 *     description: Returns a list of all supported image processing operations and their parameters
 *     tags: [Images]
 *     responses:
 *       200:
 *         description: A list of operations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 operations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Operation'
 */
router.get('/operations', imageController.getOperations);

/**
 * @swagger
 * /api/images/{operation}:
 *   post:
 *     summary: Process an image with the specified operation
 *     description: Upload an image and apply the specified processing operation
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: operation
 *         required: true
 *         schema:
 *           type: string
 *         description: The operation to perform (grayscale, blur, edge-detection, brightness, resize)
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *         description: Blur radius (for blur operation)
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *         description: Edge detection threshold (for edge-detection operation)
 *       - in: query
 *         name: adjustment
 *         schema:
 *           type: integer
 *         description: Brightness adjustment value (-100 to 100) (for brightness operation)
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *         description: Target width in pixels (for resize operation)
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *         description: Target height in pixels (for resize operation)
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
 *                 description: Image file to process
 *     responses:
 *       200:
 *         description: Image processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 operation:
 *                   type: string
 *                 params:
 *                   type: object
 *                 input:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     url:
 *                       type: string
 *                 output:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     url:
 *                       type: string
 *       400:
 *         description: Invalid input or parameters
 *       500:
 *         description: Server error
 */
router.post('/:operation', upload.single('image'), imageController.processImage);

module.exports = router;
