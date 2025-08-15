
const express = require('express');
const router = express.Router();
const scrapeController = require('../controllers/scrapeController');

// POST /jobs - Create a new scrape job
router.post('/jobs', scrapeController.createJob);

// GET /jobs - List all jobs
router.get('/jobs', scrapeController.getJobs);

// POST /jobs/:id/run - Execute a job immediately
router.post('/jobs/:id/run', scrapeController.runJob);

// GET /jobs/:id/data - Get scraped data for a job
router.get('/jobs/:id/data', scrapeController.getScrapedData);

module.exports = router;
