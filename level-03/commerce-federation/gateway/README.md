# Apollo Gateway Service

This is the Apollo Gateway service for the Commerce Federation project. It's responsible for combining all the microservices into a unified GraphQL API.

## Features

- Combines multiple GraphQL services into a single endpoint
- Handles query planning and execution across services
- Provides a unified GraphQL schema
- Easy service discovery and management

## Implementation Details

The gateway uses Apollo Federation to combine these services:

- **Products Service**: Manages product catalog data
- **Users Service**: Handles user accounts and authentication
- **Orders Service**: Processes customer orders
- **Reviews Service**: Manages product reviews

## Running the Service

```bash
# Install dependencies
npm install

# Start the service
npm start

# Start in development mode (with auto-restart)
npm run dev
```

The unified GraphQL API will be available at http://localhost:4000/graphql

## Environment Variables

- `PORT`: The port number to run the gateway (default: 4000)
- `PRODUCTS_URL`: URL of the Products service (default: http://localhost:4001)
- `USERS_URL`: URL of the Users service (default: http://localhost:4002)
- `ORDERS_URL`: URL of the Orders service (default: http://localhost:4003)
- `REVIEWS_URL`: URL of the Reviews service (default: http://localhost:4004)

You can create a `.env` file based on the `.env.example` to customize these variables.

## Using the Gateway

Once the gateway and all the services are running, you can use the GraphQL Playground at http://localhost:4000/graphql to send queries that span multiple services.

For example, you can get a user along with their orders and the products in those orders:

```graphql
query {
  user(id: "1") {
    id
    name
    email
    orders {
      id
      status
      products {
        id
        name
        price
        reviews {
          rating
          comment
        }
      }
    }
  }
}
```

This query seamlessly combines data from the Users, Orders, Products, and Reviews services.
