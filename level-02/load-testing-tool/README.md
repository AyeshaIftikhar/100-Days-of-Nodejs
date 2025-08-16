# Load Testing Tool with Artillery

## What is Artillery?
Artillery is a modern, powerful load testing toolkit that allows you to test the performance of your applications, APIs, and services. It's designed for developers and DevOps engineers to:

- Simulate high traffic loads
- Measure system performance under stress
- Identify bottlenecks and performance issues
- Validate scalability before deployment

## Artillery provides:

- Scriptable scenarios - Define complex user flows
- Real-time metrics - View performance data as tests run
- Distributed testing - Scale tests across multiple machines
- Flexible reporting - Generate HTML reports and integrate with monitoring tools

# Load Testing Tool with Artillery

![Load Testing Architecture](https://i.imgur.com/JKQyX1l.png)

A comprehensive Node.js solution for performance testing using Artillery, featuring test management, reporting, and integration capabilities.

## Features

### Core Features
- **Multiple Test Types**: Smoke, load, stress, and soak testing configurations
- **Environment Management**: Separate configurations for dev, staging, and production
- **Real-time Monitoring**: Live test progress tracking
- **Comprehensive Reporting**: JSON and HTML report generation
- **Historical Data**: Test result storage and comparison
- **Payload Support**: CSV data-driven testing

### Technical Features
- **REST API**: Manage tests and view results programmatically
- **Database Integration**: MongoDB for test scenario storage
- **Distributed Testing**: Support for running tests across multiple workers
- **Custom Plugins**: Extended metrics collection
- **CI/CD Ready**: Docker support and CLI integration

## Architecture

### Design Patterns
1. **Facade Pattern**: ArtilleryService provides a simplified interface to complex Artillery operations
2. **Observer Pattern**: Event-based monitoring of test execution
3. **Repository Pattern**: Database operations abstracted in models
4. **Strategy Pattern**: Different test configurations for various scenarios

### Component Diagram

```
[Client] → [API Gateway] → [Test Controller] → [Artillery Service] → [Report Service] → [Database]
```


### Data Flow
1. Client submits test request
2. API validates and forwards to controller
3. Artillery service executes test with proper configuration
4. Results stored in database and file system
5. Reports generated and made available

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB
- Artillery (included in package.json)

### Installation
```bash
git clone https://github.com/your-repo/load-testing-tool.git
cd load-testing-tool
npm install
cp .env.example .env
```


## Running Tests
```bash
# Run via API
curl -X POST http://localhost:3000/api/tests/run \
  -H "Content-Type: application/json" \
  -d '{"testConfig": "stress-test", "environment": "dev"}'

# Or directly via CLI
npm run load-test -- config/load-tests/stress-test.yml
```

```bash
# Via API
curl -X POST http://localhost:3000/api/tests/run \
  -H "Content-Type: application/json" \
  -d '{"testConfig": "stress-test", "environment": "prod"}'

# Direct Artillery CLI
docker-compose exec app npm run load-test -- config/load-tests/stress-test.yml
```

## Generating Reports
```bash
npm run report -- reports/report-123456789.json
```

## Monitoring Endpoints
- GET /health: Service health check
- GET /api/tests/reports: List available reports
- GET /api/tests/scenarios: List historical test runs