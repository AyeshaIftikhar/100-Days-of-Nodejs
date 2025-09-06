# Commerce Federation - GraphQL Microservices

A complete e-commerce platform built with GraphQL Federation, demonstrating how multiple microservices can work together as a unified API.

## Overview

This project showcases a real-world implementation of Apollo Federation to build a scalable e-commerce platform with the following services:

- **Gateway**: Apollo Gateway that combines all services into a unified GraphQL API
- **Products Service**: Manages the product catalog
- **Users Service**: Handles user authentication and profiles
- **Orders Service**: Processes customer orders
- **Reviews Service**: Manages customer reviews for products

## Architecture

![GraphQL Federation Architecture](./docs/architecture-diagram.png)

Each service:
- Has its own independent GraphQL schema
- Uses federation directives to share and extend types across services
- Can be deployed and scaled independently
- Communicates with other services through the Gateway

## Technologies Used

- Node.js
- Apollo Server & Apollo Federation
- GraphQL
- MongoDB (simulated with in-memory data for simplicity)
- Express
- Docker & Docker Compose

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Docker and Docker Compose (optional, for containerized setup)

### Installation

1. Clone this repository
2. Install dependencies in each service and the root directory:

```bash
# Install root dependencies
npm install

# Install dependencies for each service
npm run install:all
```

### Running the Services

You can run all services at once with:

```bash
npm run start:all
```

Or run individual services:

```bash
# Run gateway
npm run start:gateway

# Run products service
npm run start:products

# Run users service
npm run start:users

# Run orders service
npm run start:orders

# Run reviews service
npm run start:reviews
```

### Using Docker

You can also run the entire system using Docker:

```bash
docker-compose up
```

## Using the API

Once all services are running, you can access the GraphQL Playground at:

```
http://localhost:4000/graphql
```

Here are some example queries you can try:

```graphql
# Get all products with their reviews
query {
  products {
    id
    name
    price
    description
    reviews {
      id
      rating
      comment
      user {
        id
        name
      }
    }
  }
}

# Get a user with their orders
query {
  user(id: "1") {
    id
    name
    email
    orders {
      id
      orderDate
      products {
        id
        name
        price
      }
      totalAmount
    }
  }
}
```

## Project Structure

```
commerce-federation/
├── gateway/                 # Apollo Gateway service
├── services/
│   ├── products/            # Products service
│   ├── users/               # Users service
│   ├── orders/              # Orders service
│   └── reviews/             # Reviews service
├── docker-compose.yml       # Docker setup for all services
├── package.json             # Root package.json for scripts
└── README.md                # This file
```

## Future Enhancements

1. **Authentication & Authorization**
   - Implement JWT-based auth across services
   - Add role-based access control

2. **Real Database Integration**
   - Replace in-memory data with actual MongoDB/PostgreSQL instances
   - Add data persistence and proper indexing

3. **Caching Layer**
   - Implement Redis caching for frequently accessed data
   - Add cache invalidation strategies

4. **Advanced Deployment**
   - Set up Kubernetes deployment
   - Implement service mesh for better communication

5. **Monitoring & Logging**
   - Add centralized logging with ELK stack
   - Implement GraphQL-specific metrics and tracing

6. **Testing**
   - Add unit and integration tests for each service
   - Implement E2E tests for the entire system

## License

MIT
