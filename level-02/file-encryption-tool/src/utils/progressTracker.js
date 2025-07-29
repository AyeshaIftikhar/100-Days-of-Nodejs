const logger = require('./logger');

class ProgressTracker {
  constructor(operationName) {
    this.operationName = operationName;
    this.startTime = Date.now();
  }

  update(percent) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    logger.debug(`${this.operationName} progress: ${percent}% (${elapsed}s)`);
  }
}

module.exports = ProgressTracker;