# Chaos Monkey API Documentation

The Chaos Monkey tool provides a REST API for triggering and controlling chaos experiments programmatically. This allows you to integrate chaos testing into your CI/CD pipelines or orchestrate complex testing scenarios.

## API Endpoints

### GET /api

Returns basic information about the API.

**Example Response:**
```json
{
  "name": "Chaos Monkey",
  "description": "A chaos engineering tool for testing application resilience",
  "endpoints": {
    "api": "/api"
  }
}
```

### GET /api/chaos

Lists all available chaos types that can be triggered.

**Example Response:**
```json
{
  "availableTypes": [
    "cpu-stress",
    "memory-stress",
    "network-chaos",
    "api-failure",
    "database-chaos",
    "process-chaos"
  ],
  "documentation": "/api/docs"
}
```

### GET /api/metrics

Returns current system metrics.

**Example Response:**
```json
{
  "timestamp": "2023-09-10T15:30:45.123Z",
  "metrics": {
    "cpu": {
      "load": "25.30",
      "loadUser": "20.12",
      "loadSystem": "5.18",
      "processes": 8
    },
    "memory": {
      "total": "16.00",
      "used": "8.50",
      "usedPercent": "53.12"
    },
    "disk": {
      "reads": 12345678,
      "writes": 87654321,
      "ioTime": 500
    },
    "network": {
      "rxBytes": 1048576,
      "txBytes": 524288,
      "rxErrors": 0,
      "txErrors": 0
    },
    "system": {
      "uptime": 86400,
      "loadAvg": [1.5, 1.2, 1.0]
    }
  }
}
```

### POST /api/chaos/cpu-stress

Starts a CPU stress test.

**Request Body:**
```json
{
  "duration": 60,    // Duration in seconds
  "load": 80,        // CPU load percentage (1-100)
  "safeMode": true   // Enable safety checks
}
```

**Example Response:**
```json
{
  "message": "CPU stress started",
  "duration": 60,
  "load": 80,
  "safeMode": true
}
```

### POST /api/chaos/memory-stress

Starts a memory stress test.

**Request Body:**
```json
{
  "duration": 60,    // Duration in seconds
  "load": 80,        // Memory usage percentage (1-100)
  "safeMode": true   // Enable safety checks
}
```

**Example Response:**
```json
{
  "message": "Memory stress started",
  "duration": 60,
  "load": 80,
  "safeMode": true
}
```

### POST /api/chaos/network-chaos

Simulates network issues.

**Request Body:**
```json
{
  "type": "latency",    // One of: latency, loss, dns
  "target": "example.com",  // Target host
  "delay": 100,         // Delay in milliseconds (for latency)
  "rate": 10,           // Rate of packet loss (for loss)
  "duration": 60        // Duration in seconds
}
```

**Example Response:**
```json
{
  "message": "Network chaos started",
  "type": "latency",
  "options": {
    "target": "example.com",
    "delay": 100,
    "rate": 10,
    "duration": 60
  }
}
```

### POST /api/chaos/api-failure

Simulates API failures.

**Request Body:**
```json
{
  "target": "http://localhost:8080",  // Target API URL
  "status": 500,                      // HTTP status code
  "rate": 50,                         // Percentage of requests to affect
  "duration": 60                      // Duration in seconds
}
```

**Example Response:**
```json
{
  "message": "API failure simulation started",
  "options": {
    "target": "http://localhost:8080",
    "status": 500,
    "rate": 50,
    "duration": 60
  }
}
```

### POST /api/chaos/database-chaos

Simulates database issues.

**Request Body:**
```json
{
  "target": "mongodb://localhost:27017",  // Database connection string
  "action": "connection-drop",            // Action: connection-drop, query-delay
  "duration": 30,                         // Duration in seconds
  "delay": 1000                           // Delay in ms (for query-delay)
}
```

**Example Response:**
```json
{
  "message": "Database chaos started",
  "options": {
    "target": "mongodb://localhost:27017",
    "action": "connection-drop",
    "duration": 30,
    "delay": 1000
  }
}
```

### POST /api/chaos/process-chaos

Kills or restarts processes.

**Request Body:**
```json
{
  "action": "kill",          // Action: kill, restart
  "target": "nginx",         // Target process name or ID
  "random": false,           // Select a random process
  "exclude": "node,systemd"  // Comma-separated list of processes to exclude
}
```

**Example Response:**
```json
{
  "message": "Process chaos started",
  "action": "kill",
  "options": {
    "target": "nginx",
    "random": false,
    "exclude": "node,systemd"
  }
}
```

### POST /api/chaos/scenario

Runs a custom chaos scenario.

**Request Body:**
```json
{
  "name": "Custom API failure scenario",
  "type": "api",
  "target": "http://localhost:8080/users",
  "params": {
    "status": 503,
    "rate": 75
  },
  "duration": 120
}
```

**Example Response:**
```json
{
  "message": "Scenario started",
  "scenario": {
    "name": "Custom API failure scenario",
    "type": "api",
    "target": "http://localhost:8080/users",
    "params": {
      "status": 503,
      "rate": 75
    },
    "duration": 120
  }
}
```

### GET /api/scheduler

Gets all scheduled chaos experiments.

**Example Response:**
```json
{
  "scheduledTasks": [
    {
      "name": "CPU stress test",
      "schedule": "0 */2 * * *",
      "timezone": "UTC",
      "active": true
    },
    {
      "name": "Database connection failures",
      "schedule": "30 12 * * 1-5",
      "timezone": "UTC",
      "active": true
    }
  ],
  "count": 2
}
```

### DELETE /api/scheduler/:name

Stops a specific scheduled task.

**Example Response:**
```json
{
  "message": "Scheduled task \"CPU stress test\" stopped"
}
```

### DELETE /api/scheduler

Stops all scheduled tasks.

**Example Response:**
```json
{
  "message": "All scheduled tasks stopped"
}
```

## Error Responses

All API endpoints will return a standard error response format when something goes wrong:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- 400: Bad Request - Invalid parameters
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error

## Rate Limiting

The API has a rate limit of 100 requests per minute per IP address to prevent abuse.

## Authentication

For production use, it's recommended to add authentication to the API endpoints. This can be done by adding an API key or OAuth2 authentication middleware to the Express routes.
