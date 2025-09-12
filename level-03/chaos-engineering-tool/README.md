# Chaos Monkey

A Node.js-based chaos engineering tool to test application resilience by introducing controlled failures into your applications and infrastructure.

## 🔍 Overview

Chaos Monkey is inspired by Netflix's Chaos Engineering principles, designed to help developers test the resilience and recovery capabilities of their applications by deliberately injecting faults. By simulating real-world failures in a controlled environment, you can identify weaknesses before they affect your users in production.

## 🚀 Features

- **Service Disruption**: Temporarily stop or restart services
- **Resource Exhaustion**: Simulate CPU, memory, and disk space exhaustion
- **Network Failures**: Introduce latency, packet loss, and connection drops
- **API Failure Simulation**: Mock API failures with custom response codes
- **Database Chaos**: Simulate database connection failures or slow queries
- **Scheduled Attacks**: Plan chaos experiments on a schedule
- **REST API**: Control chaos experiments via a REST API
- **CLI Interface**: Easy-to-use command line interface
- **Config-driven**: Use YAML configuration files for complex scenarios
- **Detailed Reporting**: Get insights on how your system responds to failures

## 📋 Prerequisites

- Node.js 18 or newer
- npm or yarn
- For resource exhaustion tests: Linux-based OS (some features limited on macOS/Windows)
- Admin/sudo privileges for some system-level operations

## 🔧 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chaos-engineering-tool

# Install dependencies
npm install

# Make the CLI executable
chmod +x src/cli.js

# Install globally (optional)
npm install -g .
```

## 🏁 Quick Start

### Using the CLI

```bash
# Start a simple CPU stress test for 30 seconds
chaos-monkey stress cpu --duration 30

# Simulate network latency (100ms) to a specific endpoint
chaos-monkey network latency --target api.example.com --delay 100

# Simulate API failures with 50% error rate
chaos-monkey api-failure --target https://api.example.com/users --status 500 --rate 50

# Run a predefined chaos scenario from a config file
chaos-monkey run --config chaos-scenarios.yaml
```

### Using the REST API

```bash
# Start the API server
npm start

# In another terminal, trigger a chaos experiment via the API
curl -X POST http://localhost:3000/api/chaos/cpu-stress \
  -H "Content-Type: application/json" \
  -d '{"duration": 60, "load": 80}'
```

### Using Configuration Files

Create a `chaos-scenarios.yaml` file:

```yaml
scenarios:
  - name: "Database connection failure"
    type: "database"
    target: "mongodb://localhost:27017"
    action: "connection-drop"
    duration: 30
    schedule: "*/10 * * * *"  # Every 10 minutes
  
  - name: "API latency test"
    type: "api"
    target: "https://api.example.com/users"
    action: "delay"
    params:
      delay: 2000  # 2 seconds
      rate: 75     # 75% of requests
    duration: 300  # 5 minutes
```

Then run:

```bash
chaos-monkey run --config chaos-scenarios.yaml
```

## 📖 Documentation

### Commands

- `stress`: Stress system resources (CPU, memory, disk)
- `network`: Simulate network issues (latency, packet loss, DNS failures)
- `api-failure`: Mock API failures with custom status codes
- `database`: Simulate database issues
- `process`: Kill or restart processes
- `run`: Execute predefined chaos scenarios from a config file
- `monitor`: Monitor system behavior during chaos experiments

### Configuration

The tool supports extensive configuration via YAML files. See [configuration.md](docs/configuration.md) for details.

### REST API

The REST API provides endpoints to:
- List available chaos types
- Start/stop chaos experiments
- Get status of ongoing experiments
- View historical results

See [api.md](docs/api.md) for detailed API documentation.

## 🔐 Safety Measures

- **Automatic Termination**: All chaos experiments have a maximum duration
- **System Protection**: Will not run if system is already under stress
- **Recovery Validation**: Can monitor recovery after chaos is stopped
- **Production Safeguards**: Additional confirmation required for production environments

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Enhancements

1. **Container Support**: Enhanced Docker and Kubernetes chaos testing
2. **Cloud Provider Integration**: Specific chaos tests for AWS, Azure, and GCP services
3. **Machine Learning Analysis**: Predict system behavior under chaos conditions
4. **Distributed Chaos**: Coordinate chaos across multiple services
5. **Graphical Dashboard**: Visual monitoring of system behavior during chaos experiments
6. **Automated Recovery Testing**: Verify system recovery capabilities
7. **Chaos as a Service**: Multi-tenant support for organizations
8. **Compliance Reports**: Generate reports for resilience compliance requirements

## 🙏 Acknowledgements

- Inspired by Netflix's Chaos Monkey
- Built on principles from "Chaos Engineering: System Resiliency in Practice" (O'Reilly)
