const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
const TestScenario = require('../models/TestScenario');

class ArtilleryService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../reports');
    this.ensureReportsDir();
  }

  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirpSync(this.reportsDir);
    }
  }

  async runTest(testConfig, environment = 'dev') {
    try {
      const configPath = path.join(__dirname, `../../config/load-tests/${testConfig}.yml`);
      const envPath = path.join(__dirname, `../../config/environments/${environment}.yml`);
      
      if (!fs.existsSync(configPath)) {
        throw new Error(`Test configuration ${testConfig} not found`);
      }

      const reportFile = `report-${Date.now()}.json`;
      const reportPath = path.join(this.reportsDir, reportFile);

      const command = `artillery run --environment ${envPath} --output ${reportPath} ${configPath}`;

      return new Promise((resolve, reject) => {
        const testProcess = exec(command, { maxBuffer: 1024 * 1024 * 10 });

        let output = '';
        
        testProcess.stdout.on('data', (data) => {
          output += data.toString();
          logger.info(data.toString());
        });

        testProcess.stderr.on('data', (data) => {
          output += data.toString();
          logger.error(data.toString());
        });

        testProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Test failed with code ${code}`));
          }
          
          const testResult = {
            status: 'completed',
            reportFile,
            output
          };

          // Save test scenario to database
          this.saveTestScenario(testConfig, environment, testResult)
            .then(() => resolve(testResult))
            .catch((err) => {
              logger.error('Failed to save test scenario', err);
              resolve(testResult); // Resolve anyway as the test completed
            });
        });
      });
    } catch (error) {
      logger.error('Error running test:', error);
      throw error;
    }
  }

  async saveTestScenario(testConfig, environment, result) {
    const scenario = new TestScenario({
      name: testConfig,
      environment,
      status: result.status,
      reportFile: result.reportFile,
      executedAt: new Date()
    });

    return scenario.save();
  }

  async getReport(reportFile) {
    const reportPath = path.join(this.reportsDir, reportFile);
    
    if (!fs.existsSync(reportPath)) {
      throw new Error('Report not found');
    }

    return fs.readJson(reportPath);
  }

  async listReports() {
    const files = await fs.readdir(this.reportsDir);
    return files.filter(file => file.endsWith('.json'));
  }

  async listScenarios() {
    // Return all test scenarios from the database
    return TestScenario.find().sort({ createdAt: -1 });
  }
}

module.exports = new ArtilleryService();