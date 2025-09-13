# Database Sharding Demo - Setup Instructions

This document provides detailed instructions on how to set up and run the Database Sharding Demo project.

## Initial Setup

1. Clone the repository
2. Navigate to the project directory:
```bash
cd database-sharding-demo
```

3. Install all dependencies:
```bash
npm run install:all
```

## Docker Setup for MongoDB Sharding

### Prerequisites
- Docker and Docker Compose must be installed on your system
- Make sure ports 27017, 27117, 27118, 27119, and 27120 are available

### Starting the MongoDB Cluster
1. Start the MongoDB sharding cluster:
```bash
npm run docker:up
```

This command will:
- Start a MongoDB config server
- Start 3 MongoDB shard servers
- Start a MongoDB router (mongos)
- Run initialization scripts to set up the sharding configuration

2. Verify that all containers are running:
```bash
docker ps
```

You should see 5 containers running:
- config-server
- shard1
- shard2
- shard3
- mongos

### Troubleshooting Docker Setup
If you encounter issues with the Docker setup:

1. Check Docker logs:
```bash
docker logs config-server
docker logs shard1
docker logs shard2
docker logs shard3
docker logs mongos
```

2. Reset the Docker environment:
```bash
npm run docker:down
docker volume prune  # Be careful, this removes all unused volumes
npm run docker:up
```

## Database Initialization

After the MongoDB cluster is running:

1. Initialize the database with sample data:
```bash
npm run init:db
```

This will:
- Create necessary collections with appropriate sharding configurations
- Generate and insert sample users, products, and transactions
- Set up shard status information

## Running the Application

1. Start both the backend and frontend development servers:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

## Development

### Backend Development
- Backend server runs on port 3000
- API endpoints are available at http://localhost:3000/api/

### Frontend Development
- Frontend development server runs on port 5173
- React components are in the client/src/components directory
- Pages are in the client/src/pages directory

## Testing Sharding Features

To test and observe the sharding behavior:

1. Generate additional data through the UI or API
2. Use the dashboard to visualize how data is distributed
3. Trigger rebalancing to observe data migration between shards
4. Compare query performance metrics for different sharding strategies

## Stopping the Application

1. Press Ctrl+C in the terminal where the development servers are running
2. To stop the MongoDB cluster:
```bash
npm run docker:down
```
