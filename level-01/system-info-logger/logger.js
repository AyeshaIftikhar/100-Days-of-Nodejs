const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const c = chalk.default || chalk;

class Logger {
  constructor(config) {
    this.config = config;
    
    // Ensure log directory exists
    if (config.output.file) {
      const dir = path.dirname(config.output.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  logToConsole(info) {
    if (!this.config.output.console) return;
    
    console.log(c.gray(`\n[${info.timestamp}] System Info:`));
    
    if (info.cpu) {
      console.log(c.blue('CPU:'), 
        `${info.cpu.model} (${info.cpu.cores} cores)`);
      console.log('  Load:', info.cpu.loadavg.map(l => l.toFixed(2)).join(', '));
    }
    
    if (info.memory) {
      console.log(c.blue('Memory:'),
        `${info.memory.percentage}% used`,
        `(${(info.memory.used / 1024 / 1024).toFixed(2)} MB /`,
        `${(info.memory.total / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    if (info.uptime) {
      console.log(c.blue('Uptime:'), info.uptime.formatted);
    }
    
    if (info.temperature && !info.temperature.error) {
      console.log(c.blue('Temperature:'), 
        `${info.temperature.main}°C`);
    }
  }

  logToFile(info) {
    if (!this.config.output.file) return;
    
    const logEntry = JSON.stringify(info) + '\n';
    fs.appendFileSync(this.config.output.filePath, logEntry, 'utf8');
  }

  log(info) {
    this.logToConsole(info);
    this.logToFile(info);
  }
}

module.exports = Logger;