const ScrapeJob = require('../models/ScrapeJob');
const ScrapedData = require('../models/ScrapedData');
const ScrapeJobs = require('../jobs/scrapeJobs');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createJob = asyncHandler(async (req, res) => {
  const { name, url, type, selectors, schedule } = req.body;

  const job = await ScrapeJob.create({
    name,
    url,
    type,
    selectors,
    schedule,
    createdBy: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      job,
    },
  });
});

exports.getJobs = asyncHandler(async (req, res) => {
  const jobs = await ScrapeJob.find({ createdBy: req.user.id });

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: {
      jobs,
    },
  });
});

exports.runJob = asyncHandler(async (req, res) => {
  const job = await ScrapeJob.findById(req.params.id);
  
  if (!job) {
    throw new ApiError('Job not found', 404);
  }

  await ScrapeJobs.execute(job);

  res.status(200).json({
    status: 'success',
    message: 'Job executed successfully',
  });
});

exports.getScrapedData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 10, page = 1 } = req.query;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    ScrapedData.find({ jobId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ScrapedData.countDocuments({ jobId: id }),
  ]);

  res.status(200).json({
    status: 'success',
    results: data.length,
    total,
    data: {
      data,
    },
  });
});