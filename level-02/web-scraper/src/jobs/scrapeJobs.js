const EcommerceScraper = require('../scrapers/ecommerceScraper');
const NewsScraper = require('../scrapers/newsScraper');
const GenericScraper = require('../scrapers/genericScraper');
const ScrapedData = require('../models/ScrapedData');
const logger = require('../utils/logger');

class ScrapeJobs {
  static async execute(job) {
    try {
      let result;
      const startTime = Date.now();

      switch (job.type) {
        case 'ecommerce':
          result = await EcommerceScraper.scrapeProductPage(job.url);
          break;
        case 'news':
          result = await NewsScraper.scrapeNewsPage(job.url, job.selectors);
          break;
        case 'generic':
          result = await GenericScraper.scrape(job.url, job.selectors);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      const responseTime = Date.now() - startTime;

      // Store successful scrape
      await ScrapedData.create({
        jobId: job._id,
        url: job.url,
        data: result,
        status: 'success',
        metrics: {
          responseTime,
          pageSize: this._formatBytes(JSON.stringify(result).length),
        },
      });

      logger.info(`Successfully scraped ${job.url}`);
    } catch (error) {
      logger.error(`Scrape failed for ${job.url}: ${error.message}`);

      // Store failed scrape
      await ScrapedData.create({
        jobId: job._id,
        url: job.url,
        data: {},
        status: 'failed',
        error: error.message,
      });
    }
  }

  static _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = ScrapeJobs;