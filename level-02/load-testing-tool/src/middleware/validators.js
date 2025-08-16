// src/middleware/validators.js

function validateTestRequest(req, res, next) {
  const { name, environment } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Test scenario name is required and must be a string.' });
  }
  if (!['dev', 'staging', 'prod'].includes(environment)) {
    return res.status(400).json({ error: 'Environment must be one of dev, staging, prod.' });
  }
  next();
}

module.exports = { validateTestRequest };
