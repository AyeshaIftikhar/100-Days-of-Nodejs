# System Info Logger _(OS Module)_

![System Info Logger](https://github.com/AyeshaIftikhar/100-Days-of-Nodejs/blob/main/output/screenshots/system-info-logger.png)

System information logger that uses Node.js's built-in os module to collect and log system statistics.

# Features

- CPU information logging
- Memory usage tracking
- Network interface monitoring
- Disk space analysis
- Uptime reporting
- Temperature monitoring (where available)
- Configurable logging interval
- File and console output
- Historical data tracking

## How to Use

- Install dependencies:

```bash
npm init -y
npm install chalk
```

- For temperature monitoring on macOS:

```bash
brew install osx-cpu-temp
```

- Run the monitor:

```bash
node app.js
```

## Key Features

- Cross-Platform Support: Works on Linux, macOS, and Windows
- Comprehensive Monitoring: Tracks all critical system metrics
- Configurable: Enable/disable specific monitors
- Dual Output: Console and file logging
- Historical Data: JSON logs for analysis
- Temperature Monitoring: Works on Linux and macOS

## Future Enhancements

- Add web dashboard interface
- Implement alert thresholds
- Add process monitoring
- Support for remote monitoring
- Database storage option
- Docker containerization
- Export to CSV/Excel
- Email/SMS alerts
