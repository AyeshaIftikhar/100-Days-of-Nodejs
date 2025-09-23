const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Validation schemas
const charityMetadataSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(1000),
  category: Joi.string().required().valid(
    'Education', 'Healthcare', 'Environment', 'Water & Sanitation', 
    'Disaster Relief', 'Poverty Alleviation', 'Animal Welfare', 'Other'
  ),
  imageUrl: Joi.string().uri().optional(),
  targetAmount: Joi.string().required(),
  documents: Joi.array().items(Joi.string()).optional(),
  contactEmail: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  socialMedia: Joi.object({
    twitter: Joi.string().optional(),
    facebook: Joi.string().optional(),
    instagram: Joi.string().optional()
  }).optional()
});

// Mock database - in production, use MongoDB
let charities = [
  {
    id: '1',
    name: 'Clean Water Initiative',
    description: 'Providing clean water access to rural communities in developing countries. Our mission is to build sustainable water infrastructure and educate communities on water conservation.',
    category: 'Water & Sanitation',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500',
    targetAmount: '10',
    documents: ['ipfs://QmDoc1', 'ipfs://QmDoc2'],
    contactEmail: 'contact@cleanwater.org',
    website: 'https://cleanwater.org',
    socialMedia: {
      twitter: '@cleanwaterorg',
      facebook: 'cleanwaterinitiative'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Education for All',
    description: 'Building schools and providing educational materials for underprivileged children. We believe every child deserves access to quality education.',
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500',
    targetAmount: '15',
    documents: ['ipfs://QmDoc3'],
    contactEmail: 'info@educationforall.org',
    website: 'https://educationforall.org',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET /api/charities - Get all charities metadata
router.get('/', (req, res) => {
  try {
    const { category, verified, active, search } = req.query;
    let filteredCharities = [...charities];

    // Filter by category
    if (category) {
      filteredCharities = filteredCharities.filter(
        charity => charity.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCharities = filteredCharities.filter(
        charity => 
          charity.name.toLowerCase().includes(searchTerm) ||
          charity.description.toLowerCase().includes(searchTerm) ||
          charity.category.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      success: true,
      data: filteredCharities,
      total: filteredCharities.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charities',
      error: error.message
    });
  }
});

// GET /api/charities/:id - Get specific charity metadata
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const charity = charities.find(c => c.id === id);

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }

    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charity',
      error: error.message
    });
  }
});

// POST /api/charities - Create new charity metadata
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = charityMetadataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Create new charity
    const newCharity = {
      id: (charities.length + 1).toString(),
      ...value,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    charities.push(newCharity);

    res.status(201).json({
      success: true,
      message: 'Charity metadata created successfully',
      data: newCharity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating charity',
      error: error.message
    });
  }
});

// PUT /api/charities/:id - Update charity metadata
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const charityIndex = charities.findIndex(c => c.id === id);

    if (charityIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }

    // Validate request body
    const { error, value } = charityMetadataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Update charity
    charities[charityIndex] = {
      ...charities[charityIndex],
      ...value,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Charity metadata updated successfully',
      data: charities[charityIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating charity',
      error: error.message
    });
  }
});

// GET /api/charities/categories - Get all categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    'Education',
    'Healthcare', 
    'Environment',
    'Water & Sanitation',
    'Disaster Relief',
    'Poverty Alleviation',
    'Animal Welfare',
    'Other'
  ];

  res.json({
    success: true,
    data: categories
  });
});

// GET /api/charities/stats - Get platform statistics
router.get('/meta/stats', (req, res) => {
  try {
    const stats = {
      totalCharities: charities.length,
      categories: charities.reduce((acc, charity) => {
        acc[charity.category] = (acc[charity.category] || 0) + 1;
        return acc;
      }, {}),
      totalTargetAmount: charities.reduce((sum, charity) => 
        sum + parseFloat(charity.targetAmount), 0
      ).toString()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

module.exports = router;
