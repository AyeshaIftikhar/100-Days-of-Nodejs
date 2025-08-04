const fs = require('fs-extra');
const path = require('path');
const { createHtmlReport } = require('artillery-plugin-metrics-by-endpoint');
const logger = require('../utils/logger');

class ReportService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../reports');
    this.ensureReportsDir();
  }

  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirpSync(this.reportsDir);
    }
  }

  async generateHtmlReport(jsonReportPath) {
    try {
      const reportData = await fs.readJson(jsonReportPath);
      const htmlReport = await createHtmlReport(reportData);
      
      const htmlReportPath = jsonReportPath.replace('.json', '.html');
      await fs.writeFile(htmlReportPath, htmlReport);
      
      logger.info(`HTML report generated: ${htmlReportPath}`);
      return htmlReportPath;
    } catch (error) {
      logger.error('Error generating HTML report:', error);
      throw error;
    }
  }

  async cleanupOldReports(maxAgeDays = 7) {
    try {
      const files = await fs.readdir(this.reportsDir);
      const now = Date.now();
      const cutoff = now - (maxAgeDays * 24 * 60 * 60 * 1000);
      
      for (const file of files) {
        const filePath = path.join(this.reportsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtimeMs < cutoff) {
          await fs.remove(filePath);
          logger.info(`Removed old report: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up old reports:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();