const ScrapeJob = require("../models/ScrapeJob");
const ScrapedData = require("../models/ScrapedData");
const ScrapeJobs = require("../jobs/scrapeJobs");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

exports.createJob = asyncHandler(async (req, res) => {
  // Temporary: set default user for testing
  // const mongoose = require('mongoose');
  // if (!req.user) req.user = { id: mongoose.Types.ObjectId('64d9f1f1f1f1f1f1f1f1f1f1') };

  const { name, url, type, selectors, schedule } = req.body || {};

  const job = await ScrapeJob.create({
    name,
    url,
    type,
    selectors,
    schedule,
    // createdBy: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: {
      job,
    },
  });
});

exports.getJobs = asyncHandler(async (req, res) => {
  // Temporary: set default user for testing
    // Temporary: set default user for testing
    // const mongoose = require('mongoose');
    // if (!req.user) req.user = { id: mongoose.Types.ObjectId('64d9f1f1f1f1f1f1f1f1f1f1') };

    const jobs = await ScrapeJob.find({});
    res.status(200).json({
      status: "success",
      results: jobs.length,
      data: {
        jobs,
      },
    });
});

exports.runJob = asyncHandler(async (req, res) => {
  const job = await ScrapeJob.findById(req.params.id);

  if (!job) {
    throw new ApiError("Job not found", 404);
  }

  // Execute the job and get scraped data (assuming ScrapeJobs.execute returns data)
  const scrapedData = await ScrapeJobs.execute(job);

  // Save scraped data with required source field
  if (scrapedData) {
    await ScrapedData.create({
      source: job.url || 'unknown',
      data: scrapedData,
      scrapedAt: new Date(),
      jobId: job._id
    });
  }

  res.status(200).json({
    status: "success",
    message: "Job executed successfully",
    scrapedData: scrapedData || null
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
    status: "success",
    results: data.length,
    total,
    data: {
      data,
    },
  });
});
