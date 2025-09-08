const path = require('path');
const { benchmark } = require('../services/benchmarkService');
const { logger } = require('../services/loggerService');

// Run benchmark
const runBenchmark = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }
    
    // Get number of iterations from query param
    const iterations = req.query.iterations ? parseInt(req.query.iterations) : 5;
    
    // Limit iterations to prevent server overload
    const limitedIterations = Math.min(Math.max(1, iterations), 20);
    
    // Run benchmark
    const result = await benchmark(req.file.path, limitedIterations);
    
    res.status(200).json({
      success: true,
      iterations: limitedIterations,
      benchmarkResults: result
    });
  } catch (error) {
    logger.error('Error in benchmark controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run benchmark',
      error: error.message
    });
  }
};

module.exports = {
  runBenchmark
};
