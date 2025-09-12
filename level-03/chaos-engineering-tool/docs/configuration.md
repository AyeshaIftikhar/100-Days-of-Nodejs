# Configuration Guide

Chaos Monkey supports extensive configuration via YAML or JSON files. This allows you to define reusable chaos scenarios, schedule experiments, and customize tool behavior.

## Configuration File Format

Chaos Monkey configurations can be written in either YAML or JSON format. YAML is recommended for better readability. The configuration file has the following structure:

```yaml
# Global settings
safeMode: true
logLevel: info

# Scheduled experiments
scheduledExperiments:
  - name: "CPU stress test"
    type: "cpu"
    load: 70
    duration: 30
    schedule: "0 */2 * * *"  # Every 2 hours
    
  - name: "API latency test"
    type: "api"
    target: "http://localhost:3000/api/users"
    params:
      status: 200
      rate: 100
      delay: 2000
    duration: 120
    schedule: "30 12 * * 1-5"  # Weekdays at 12:30

# Scenarios for on-demand execution
scenarios:
  - name: "Memory pressure"
    type: "memory"
    load: 80
    duration: 60
    
  - name: "Network latency"
    type: "network"
    action: "latency"
    target: "api.example.com"
    params:
      delay: 200
    duration: 90
```

## Global Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `safeMode` | Enable safety checks to prevent system crash | `true` |
| `logLevel` | Logging level (debug, info, warn, error) | `info` |

## Scenario Configuration

Each scenario must include the following fields:

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Unique name for the scenario | Yes |
| `type` | Type of chaos experiment | Yes |
| `duration` | Duration in seconds | Yes |
| `schedule` | Cron expression for scheduled execution | No |

Depending on the scenario type, additional fields are required:

### CPU Stress Scenario

```yaml
name: "CPU stress test"
type: "cpu"
load: 70              # CPU load percentage (1-100)
duration: 30          # Duration in seconds
safeMode: true        # Enable safety checks
```

### Memory Stress Scenario

```yaml
name: "Memory pressure"
type: "memory"
load: 80              # Memory usage percentage (1-100)
duration: 60          # Duration in seconds
safeMode: true        # Enable safety checks
```

### Network Chaos Scenario

```yaml
name: "Network latency"
type: "network"
action: "latency"     # One of: latency, loss, dns
target: "api.example.com"  # Target host
params:
  delay: 200          # Delay in milliseconds (for latency)
  rate: 10            # Rate of packet loss (for loss)
duration: 90          # Duration in seconds
```

### API Failure Scenario

```yaml
name: "API errors"
type: "api"
target: "http://localhost:3000/api/users"  # Target API URL
params:
  status: 500         # HTTP status code
  rate: 50            # Percentage of requests to affect
  delay: 0            # Optional delay in ms
duration: 60          # Duration in seconds
```

### Database Chaos Scenario

```yaml
name: "Database connection failures"
type: "database"
target: "mongodb://localhost:27017"  # Database connection string
action: "connection-drop"            # Action: connection-drop, query-delay
params:
  delay: 1000         # Delay in ms (for query-delay)
duration: 30          # Duration in seconds
```

### Process Chaos Scenario

```yaml
name: "Process restart"
type: "process"
action: "restart"     # Action: kill, restart
target: "nginx"       # Target process name or ID
random: false         # Select a random process
exclude: "node,ssh"   # Comma-separated list of processes to exclude
```

## Scheduling

Chaos Monkey uses cron expressions for scheduling experiments. The format is:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Common examples:

| Expression | Description |
|------------|-------------|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour at minute 0 |
| `0 */2 * * *` | Every 2 hours |
| `0 9 * * 1-5` | 9 AM on weekdays |
| `0 0 * * 0` | Midnight on Sunday |
| `30 12 * * *` | 12:30 PM every day |

You can also specify a timezone for the schedule:

```yaml
name: "CPU stress test"
type: "cpu"
load: 70
duration: 30
schedule: "0 9 * * 1-5"
timezone: "America/New_York"  # Eastern Time
```

## Configuration Loading

By default, Chaos Monkey looks for a `chaos-config.yaml` file in the current working directory. You can specify a different config file using the `--config` option:

```bash
chaos-monkey run --config /path/to/my-config.yaml
```

For the API server, you can specify the config file path in the `CHAOS_CONFIG` environment variable or pass it as a command-line argument:

```bash
CHAOS_CONFIG=/path/to/my-config.yaml npm start
```

## Environment Variables

Chaos Monkey also supports configuration via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CHAOS_CONFIG` | Path to config file | `./chaos-config.yaml` |
| `LOG_LEVEL` | Logging level | `info` |
| `PORT` | API server port | `3000` |
| `SAFE_MODE` | Enable safety checks | `true` |

## Configuration Best Practices

1. **Start small**: Begin with short durations and moderate loads
2. **Use safeMode**: Always enable safeMode in production environments
3. **Exclude critical services**: Always exclude mission-critical services
4. **Schedule carefully**: Run experiments during off-peak hours initially
5. **Monitor results**: Always monitor system behavior during experiments
6. **Version control**: Keep your chaos configurations in version control
7. **Document experiments**: Add comments to your configuration files explaining the purpose of each scenario
