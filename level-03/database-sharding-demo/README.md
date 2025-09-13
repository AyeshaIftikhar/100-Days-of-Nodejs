# Database Sharding Demo

A full-stack application demonstrating database sharding concepts with real-time visualization and performance metrics.

## Overview

This project provides a practical demonstration of database sharding techniques using MongoDB, Node.js, and a modern React frontend. It allows users to understand and interact with different sharding strategies while visualizing how data gets distributed across shards in real-time.

## What is Database Sharding?

Database sharding is a horizontal partitioning strategy that splits a large database into smaller, faster, and more manageable pieces called shards. Each shard contains a subset of the data, distributed according to a sharding key. This approach helps improve performance, scalability, and availability of database systems handling large datasets.

## Features

- **Interactive Sharding Visualization**: See real-time data distribution across multiple shards
- **Multiple Sharding Strategies**: 
  - Range-based sharding (by ID ranges)
  - Hash-based sharding (even distribution)
  - Geographic sharding (location-based)
- **Performance Dashboard**: Compare query times between sharded and non-sharded setups
- **Data Generator**: Create sample data to test different sharding configurations
- **Query Builder**: Build and execute custom queries against the sharded database
- **Shard Rebalancing**: Visualize how data migrates when adding/removing shards

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB (multiple instances for shards)
- Mongoose for MongoDB interactions

### Frontend
- React 18+
- TypeScript
- Vite as the build tool
- shadcn-ui component library
- Tailwind CSS for styling
- React Query for data fetching
- Recharts for data visualization

### Infrastructure
- Docker & Docker Compose for running multiple MongoDB instances
- MongoDB Sharded Cluster (1 config server, 3 shards, 1 mongos router)

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- MongoDB (latest version)
- Git

## Installation

1. Clone the repository
2. Install dependencies for the project:

```bash
cd database-sharding-demo
npm install
```

3. Start the MongoDB sharding cluster using Docker:

```bash
npm run docker:up
```

4. Initialize the database with sample data:

```bash
npm run init:db
```

5. Start the development servers:

```bash
npm run dev
```

6. Open your browser and navigate to http://localhost:5173

## Project Structure

```
database-sharding-demo/
├── client/                # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # Source files
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript type definitions
│   │   └── App.tsx        # Main application component
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
├── server/                # Backend Node.js application
│   ├── src/               # Source files
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── tsconfig.json      # TypeScript configuration
│   └── package.json       # Dependencies and scripts
├── docker/                # Docker configuration
│   ├── docker-compose.yml # Docker Compose configuration
│   └── mongo/             # MongoDB configuration scripts
├── scripts/               # Utility scripts
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## Sharding Strategies

### Range-Based Sharding
Data is distributed based on ranges of a shard key. For example:
- Shard 1: Records with IDs 1-1000
- Shard 2: Records with IDs 1001-2000
- Shard 3: Records with IDs 2001+

### Hash-Based Sharding
A hash function is applied to the shard key to determine which shard receives the data. This approach provides more even distribution but makes range queries less efficient.

### Geographic Sharding
Data is sharded based on geographic location, allowing data to be stored closer to the users who access it most frequently.

## API Documentation

The backend API provides the following endpoints:

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:userId` - Get a specific user by ID
- `POST /api/users` - Create a new user

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:productId` - Get a specific product by ID
- `POST /api/products` - Create a new product

### Transactions
- `GET /api/transactions` - Get all transactions (with pagination)
- `GET /api/transactions/:transactionId` - Get a specific transaction by ID
- `POST /api/transactions` - Create a new transaction
- `PATCH /api/transactions/:transactionId/status` - Update transaction status

### Shards
- `GET /api/shards` - Get information about current shards
- `GET /api/shards/statistics` - Get shard statistics and data distribution
- `GET /api/shards/performance` - Get performance metrics
- `POST /api/shards/rebalance` - Trigger shard rebalancing

## Future Enhancements

1. **Multi-Region Sharding**: Extend the demo to simulate geographically distributed shards with simulated network latency.
2. **Advanced Sharding Strategies**: Implement compound shard keys and zone sharding demonstrations.
3. **Failure Simulation**: Add tools to simulate shard failures and recovery processes.
4. **Custom Balancer**: Implement a custom balancing algorithm for shard distribution.
5. **Real-time Analytics**: Add real-time analytics dashboards showing shard performance.
6. **Schema Design Recommendations**: Provide automated recommendations for optimal schema design based on sharding patterns.
7. **Benchmarking Tools**: Add tools to benchmark different sharding strategies.
8. **Migration Utilities**: Create utilities to demonstrate safe migration between sharding strategies.
9. **Automated Scaling**: Implement automated scaling of shards based on load.
10. **Visual Query Explainer**: Add a visual tool to explain how queries are executed across shards.

## License

MIT
