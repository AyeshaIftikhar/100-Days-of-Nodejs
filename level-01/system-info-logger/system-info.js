const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

class SystemInfo {
  static getCPUInfo() {
    return {
      model: os.cpus()[0].model,
      cores: os.cpus().length,
      usage: process.cpuUsage(),
      loadavg: os.loadavg()
    };
  }

  static getMemoryInfo() {
    return {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      percentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
    };
  }

  static getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const result = {};
    
    Object.keys(interfaces).forEach(name => {
      result[name] = interfaces[name].map(iface => ({
        address: iface.address,
        netmask: iface.netmask,
        family: iface.family,
        mac: iface.mac,
        internal: iface.internal
      }));
    });
    
    return result;
  }

  static getDiskInfo() {
    try {
      const df = execSync('df -h').toString();
      return df.split('\n').slice(1).map(line => {
        const parts = line.split(/\s+/);
        return parts.length >= 6 ? {
          filesystem: parts[0],
          size: parts[1],
          used: parts[2],
          available: parts[3],
          usePercent: parts[4],
          mount: parts[5]
        } : null;
      }).filter(Boolean);
    } catch {
      return [{ error: 'Could not retrieve disk info' }];
    }
  }

  static getUptime() {
    return {
      system: os.uptime(),
      formatted: this.formatUptime(os.uptime())
    };
  }

  static formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    seconds %= 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    
    return `${days}d ${hours}h ${minutes}m ${Math.floor(seconds)}s`;
  }

  static getTemperature() {
    try {
      // Linux temperature (if available)
      if (fs.existsSync('/sys/class/thermal/thermal_zone0/temp')) {
        const temp = parseInt(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp'));
        return { main: temp / 1000 };
      }
      
      // macOS temperature (requires osx-temperature-sensor)
      try {
        const temp = execSync('osx-cpu-temp').toString().trim();
        return { main: parseFloat(temp.replace('°C', '')) };
      } catch {}
      
      return { error: 'Temperature not available' };
    } catch {
      return { error: 'Temperature not available' };
    }
  }

  static getAllInfo(config) {
    const timestamp = new Date().toISOString();
    const info = { timestamp };
    
    if (config.monitor.cpu) info.cpu = this.getCPUInfo();
    if (config.monitor.memory) info.memory = this.getMemoryInfo();
    if (config.monitor.network) info.network = this.getNetworkInfo();
    if (config.monitor.disk) info.disk = this.getDiskInfo();
    if (config.monitor.uptime) info.uptime = this.getUptime();
    if (config.monitor.temperature) info.temperature = this.getTemperature();
    
    return info;
  }
}

module.exports = SystemInfo;