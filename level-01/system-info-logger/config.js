module.exports = {
  // Logging interval in seconds
  interval: 5,

  // Output options
  output: {
    console: true,
    file: true,
    filePath: "./logs/system-info.log",
  },

  // What to monitor
  monitor: {
    cpu: true,
    memory: true,
    network: true,
    disk: true,
    uptime: true,
    temperature: true,
  },
};
