# Products Service

This is the Products microservice for the Commerce Federation project. It's responsible for managing the product catalog in the e-commerce platform.

## Features

- Exposes product data via GraphQL
- Federation support to integrate with other services
- Query products by ID, category, or get all products
- In-memory database (for demonstration purposes)

## GraphQL Schema

The service defines the following GraphQL types:

```graphql
enum Category {
  ELECTRONICS
  CLOTHING
  BOOKS
  ACCESSORIES
  HOME
  OTHER
}

type Product @key(fields: "id") {
  id: ID!
  name: String!
  price: Float!
  description: String
  category: Category!
  inStock: Boolean!
}

extend type Query {
  products: [Product!]!
  product(id: ID!): Product
  productsByCategory(category: Category!): [Product!]!
}
```

## Available Queries

- `products`: Get all products
- `product(id: ID!)`: Get a specific product by ID
- `productsByCategory(category: Category!)`: Get all products in a specific category

## Federation Support

This service participates in the GraphQL Federation by:

- Defining the `Product` type as an entity with `@key(fields: "id")`
- Implementing the `__resolveReference` function to resolve Product references from other services

## Running the Service

```bash
# Install dependencies
npm install

# Start the service
npm start

# Start in development mode (with auto-restart)
npm run dev
```

The service will be available at http://localhost:4001/graphql

## Environment Variables

- `PORT`: The port number to run the service (default: 4001)

You can create a `.env` file based on the `.env.example` to customize these variables.
