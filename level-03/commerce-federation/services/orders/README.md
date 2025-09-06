# Orders Service

This is the Orders microservice for the Commerce Federation project. It's responsible for managing customer orders in the e-commerce platform.

## Features

- Exposes order data via GraphQL
- Federation support to integrate with other services
- Query orders by ID, by user, or get all orders
- References products and users from their respective services
- In-memory database (for demonstration purposes)

## GraphQL Schema

The service defines the following GraphQL types:

```graphql
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

type Order @key(fields: "id") {
  id: ID!
  user: User!
  orderDate: String!
  status: OrderStatus!
  products: [Product!]!
  totalAmount: Float!
}

extend type User @key(fields: "id") {
  id: ID! @external
  orders: [Order!]!
}

extend type Product @key(fields: "id") {
  id: ID! @external
}

extend type Query {
  orders: [Order!]!
  order(id: ID!): Order
  ordersByUser(userId: ID!): [Order!]!
}
```

## Available Queries

- `orders`: Get all orders
- `order(id: ID!)`: Get a specific order by ID
- `ordersByUser(userId: ID!)`: Get all orders for a specific user

## Federation Support

This service participates in the GraphQL Federation by:

- Defining the `Order` type as an entity with `@key(fields: "id")`
- Extending the `User` type to add an `orders` field
- Referencing the `Product` type from the Products service
- Implementing the `__resolveReference` function to resolve Order references from other services

## Running the Service

```bash
# Install dependencies
npm install

# Start the service
npm start

# Start in development mode (with auto-restart)
npm run dev
```

The service will be available at http://localhost:4003/graphql

## Environment Variables

- `PORT`: The port number to run the service (default: 4003)

You can create a `.env` file based on the `.env.example` to customize these variables.
