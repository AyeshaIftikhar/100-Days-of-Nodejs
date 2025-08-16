const artilleryService = require('../services/artilleryService');
const logger = require('../utils/logger');

class TestController {
  async runTest(req, res) {
    try {
      const { testConfig, environment } = req.body;
      
      logger.info(`Starting test: ${testConfig} for environment: ${environment}`);
      
      const result = await artilleryService.runTest(testConfig, environment);
      
      res.json({
        success: true,
        message: 'Test started successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in runTest:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getReport(req, res) {
    try {
      const { reportFile } = req.params;
      const report = await artilleryService.getReport(reportFile);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error in getReport:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listReports(req, res) {
    try {
      const reports = await artilleryService.listReports();
      
      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      logger.error('Error in listReports:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
    async listScenarios(req, res) {
      try {
        const scenarios = await artilleryService.listScenarios();
        res.json({
          success: true,
          data: scenarios
        });
      } catch (error) {
        logger.error('Error in listScenarios:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
}

module.exports = new TestController();