const express = require('express');
const TestController = require('../controllers/testController');
const { validateTestRequest } = require('../middleware/validators');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/run', 
  rateLimiter,
  validateTestRequest,
  TestController.runTest
);

router.get('/reports', 
  rateLimiter,
  TestController.listReports
);

router.get('/reports/:reportFile', 
  rateLimiter,
  TestController.getReport
);

router.get('/scenarios', 
  rateLimiter,
  TestController.listScenarios
);

module.exports = router;