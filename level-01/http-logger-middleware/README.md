# HTTP Logger Middleware

`http-logger-middleware` is a simple and extensible middleware module for Node.js (Express.js framework) that logs incoming HTTP requests. It captures useful data such as method, endpoint, status code, response time, and timestamp, and logs it to both the console and a log file.

This project is useful for debugging, auditing, and monitoring HTTP traffic in small to mid-size Node.js applications.

## Features

- Logs request method, URL, status code, response time
- Saves logs to a file (http-logs.txt)
- Outputs logs in readable format to the console
- Tracks performance (latency per request)
- Middleware-based plug & play module for Express.js

## 🚀 Future Enhancements

| Feature                          | Description |
|----------------------------------|-------------|
| 🔒 Mask sensitive fields         | Hide passwords, tokens, etc. from logs |
| 🧾 JSON-formatted logs           | Make logs machine-readable (e.g., for ELK stack) |
| 📦 Package as npm module         | Allow reusability via `npm install http-logger` |
| 📡 Send logs to external service | e.g., Datadog, Loggly, or AWS CloudWatch |
| 🌐 IP and user-agent logging     | Capture client info for analytics |
| 🔥 Error-specific logging        | Highlight requests that failed (4xx/5xx) |
| 📊 Log rotation & archiving      | Archive logs periodically to avoid file bloat |
| 📁 Middleware toggle             | Enable/disable logging based on environment |