const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const imageService = require('../services/imageService');

// Helper to validate parameters
const validateParams = (operation, params) => {
  switch (operation) {
    case 'resize':
      if (!params.width || !params.height) {
        throw new Error('Width and height are required for resize operation');
      }
      params.width = parseInt(params.width);
      params.height = parseInt(params.height);
      if (isNaN(params.width) || isNaN(params.height)) {
        throw new Error('Width and height must be valid numbers');
      }
      if (params.width <= 0 || params.height <= 0) {
        throw new Error('Width and height must be positive numbers');
      }
      break;
      
    case 'blur':
      if (params.radius) {
        params.radius = parseInt(params.radius);
        if (isNaN(params.radius) || params.radius <= 0) {
          throw new Error('Radius must be a positive number');
        }
      } else {
        params.radius = 3; // Default radius
      }
      break;
      
    case 'edge-detection':
      if (params.threshold) {
        params.threshold = parseInt(params.threshold);
        if (isNaN(params.threshold) || params.threshold < 0) {
          throw new Error('Threshold must be a non-negative number');
        }
      } else {
        params.threshold = 50; // Default threshold
      }
      break;
      
    case 'brightness':
      if (params.adjustment) {
        params.adjustment = parseInt(params.adjustment);
        if (isNaN(params.adjustment)) {
          throw new Error('Brightness adjustment must be a number');
        }
        if (params.adjustment < -100 || params.adjustment > 100) {
          throw new Error('Brightness adjustment must be between -100 and 100');
        }
      } else {
        params.adjustment = 0; // Default adjustment (no change)
      }
      break;
      
    case 'grayscale':
      // No specific parameters needed for grayscale
      break;
      
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
  
  return params;
};

// Process an uploaded image
const processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }
    
    const { operation } = req.params;
    
    // Get parameters from query string
    let params = { ...req.query };
    
    // Validate and convert parameters
    try {
      params = validateParams(operation, params);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Generate a unique filename for the processed image
    const inputPath = req.file.path;
    const fileExt = path.extname(req.file.originalname);
    const outputFilename = `${uuidv4()}${fileExt}`;
    const outputPath = path.join(__dirname, '../../uploads', outputFilename);
    
    // Process the image
    const result = await imageService.processImage(inputPath, outputPath, operation, params);
    
    // Generate URLs for the images
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const inputUrl = `${baseUrl}/uploads/${path.basename(inputPath)}`;
    const outputUrl = `${baseUrl}/uploads/${outputFilename}`;
    
    res.status(200).json({
      success: true,
      operation,
      params,
      input: {
        filename: req.file.originalname,
        url: inputUrl
      },
      output: {
        filename: outputFilename,
        url: outputUrl
      }
    });
  } catch (error) {
    console.error('Error in processImage controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process image',
      error: error.message
    });
  }
};

// Get all available operations
const getOperations = (req, res) => {
  const operations = [
    {
      name: 'grayscale',
      description: 'Convert image to grayscale',
      params: []
    },
    {
      name: 'blur',
      description: 'Apply blur effect to the image',
      params: [
        {
          name: 'radius',
          type: 'number',
          description: 'Blur radius (default: 3)',
          required: false
        }
      ]
    },
    {
      name: 'edge-detection',
      description: 'Detect edges in the image',
      params: [
        {
          name: 'threshold',
          type: 'number',
          description: 'Edge detection threshold (default: 50)',
          required: false
        }
      ]
    },
    {
      name: 'brightness',
      description: 'Adjust image brightness',
      params: [
        {
          name: 'adjustment',
          type: 'number',
          description: 'Brightness adjustment (-100 to 100, default: 0)',
          required: false
        }
      ]
    },
    {
      name: 'resize',
      description: 'Resize the image',
      params: [
        {
          name: 'width',
          type: 'number',
          description: 'Target width in pixels',
          required: true
        },
        {
          name: 'height',
          type: 'number',
          description: 'Target height in pixels',
          required: true
        }
      ]
    }
  ];
  
  res.status(200).json({
    success: true,
    operations
  });
};

module.exports = {
  processImage,
  getOperations
};
