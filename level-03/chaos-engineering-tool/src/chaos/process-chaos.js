const { exec } = require('child_process');
const os = require('os');
const logger = require('../utils/logger');

/**
 * Kill or restart processes
 * @param {string} action - Action to take (kill, restart)
 * @param {object} options - Configuration options
 */
function start(action, options) {
  const target = options.target;
  const random = options.random;
  const exclude = options.exclude ? options.exclude.split(',').map(p => p.trim()) : [];
  
  logger.info(`Starting process chaos: ${action}`);
  
  // Always exclude critical system processes and our own process
  const criticalProcesses = ['systemd', 'init', 'launchd', 'sshd', 'bash', 'zsh', 'node'];
  const safeExclude = [...new Set([...criticalProcesses, ...exclude, process.title])];
  
  if (!target && !random) {
    logger.error('Either --target or --random must be specified');
    return;
  }
  
  if (action !== 'kill' && action !== 'restart') {
    logger.error(`Unknown process action: ${action}`);
    return;
  }
  
  // Get the target process ID
  let command = '';
  
  if (target) {
    // Check if target is a PID or a process name
    if (/^\d+$/.test(target)) {
      command = `ps -p ${target} -o comm=`;
    } else {
      command = `pgrep -l ${target}`;
    }
  } else if (random) {
    // Get a random process that's not in the exclude list
    const excludePattern = safeExclude.map(p => `grep -v ${p}`).join(' | ');
    command = `ps aux | grep -v "grep" | ${excludePattern} | sort -R | head -n 1`;
  }
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Failed to find target process: ${error.message}`);
      return;
    }
    
    if (!stdout.trim()) {
      logger.error('No matching processes found');
      return;
    }
    
    logger.debug(`Process lookup output: ${stdout.trim()}`);
    
    // Extract the PID from the output
    let pid;
    let processName;
    
    if (target && /^\d+$/.test(target)) {
      pid = target;
      processName = stdout.trim();
    } else if (random) {
      // Extract from ps aux output (PID is the second column)
      const parts = stdout.trim().split(/\s+/);
      pid = parts[1];
      processName = parts[10] || 'unknown';
    } else {
      // Extract from pgrep -l output (format: "PID process_name")
      const parts = stdout.trim().split(/\s+/);
      pid = parts[0];
      processName = parts.slice(1).join(' ');
    }
    
    // Final safety check
    if (safeExclude.some(p => processName.includes(p))) {
      logger.error(`Cannot ${action} ${processName} (PID ${pid}): protected process`);
      return;
    }
    
    logger.info(`Selected process: ${processName} (PID ${pid})`);
    
    // Perform the action
    if (action === 'kill') {
      killProcess(pid, processName);
    } else if (action === 'restart') {
      restartProcess(pid, processName);
    }
  });
}

/**
 * Kill a process
 */
function killProcess(pid, processName) {
  logger.info(`Killing process: ${processName} (PID ${pid})`);
  
  exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Failed to kill process: ${error.message}`);
      return;
    }
    
    logger.info(`Successfully killed process ${processName} (PID ${pid})`);
  });
}

/**
 * Restart a process (kill and let it be restarted by service manager)
 */
function restartProcess(pid, processName) {
  logger.info(`Restarting process: ${processName} (PID ${pid})`);
  
  // First check if the process is managed by systemd
  exec(`systemctl status | grep ${processName}`, (error, stdout, stderr) => {
    if (!error && stdout.trim()) {
      // Process is managed by systemd
      const serviceName = stdout.trim().split(/\s+/)[0];
      logger.info(`Process ${processName} is managed by systemd as ${serviceName}`);
      
      exec(`sudo systemctl restart ${serviceName}`, (err, out, stderr) => {
        if (err) {
          logger.error(`Failed to restart service ${serviceName}: ${err.message}`);
          logger.info('Falling back to kill, letting service manager restart it');
          killProcess(pid, processName);
        } else {
          logger.info(`Successfully restarted service ${serviceName}`);
        }
      });
    } else {
      // Check if managed by pm2
      exec(`pm2 list | grep ${processName}`, (error, stdout, stderr) => {
        if (!error && stdout.trim()) {
          // Process is managed by pm2
          logger.info(`Process ${processName} is managed by pm2`);
          
          exec(`pm2 restart ${processName}`, (err, out, stderr) => {
            if (err) {
              logger.error(`Failed to restart PM2 process ${processName}: ${err.message}`);
              logger.info('Falling back to kill, letting service manager restart it');
              killProcess(pid, processName);
            } else {
              logger.info(`Successfully restarted PM2 process ${processName}`);
            }
          });
        } else {
          // No service manager found, just kill and let it be restarted by whatever monitors it
          logger.info('No service manager found for the process');
          logger.info('Killing process and letting it be restarted by its monitor');
          killProcess(pid, processName);
        }
      });
    }
  });
}

module.exports = { start };
