# Reviews Service

This is the Reviews microservice for the Commerce Federation project. It's responsible for managing product reviews in the e-commerce platform.

## Features

- Exposes review data via GraphQL
- Federation support to integrate with other services
- Query reviews by ID, by product, by user, or get all reviews
- Create new reviews with mutation
- References products and users from their respective services
- In-memory database (for demonstration purposes)

## GraphQL Schema

The service defines the following GraphQL types:

```graphql
type Review @key(fields: "id") {
  id: ID!
  product: Product!
  user: User!
  rating: Int!
  comment: String
  createdAt: String!
}

extend type Product @key(fields: "id") {
  id: ID! @external
  reviews: [Review!]!
}

extend type User @key(fields: "id") {
  id: ID! @external
  reviews: [Review!]!
}

extend type Query {
  reviews: [Review!]!
  review(id: ID!): Review
  reviewsByProduct(productId: ID!): [Review!]!
  reviewsByUser(userId: ID!): [Review!]!
}

extend type Mutation {
  addReview(productId: ID!, userId: ID!, rating: Int!, comment: String): Review!
}
```

## Available Queries

- `reviews`: Get all reviews
- `review(id: ID!)`: Get a specific review by ID
- `reviewsByProduct(productId: ID!)`: Get all reviews for a specific product
- `reviewsByUser(userId: ID!)`: Get all reviews by a specific user

## Available Mutations

- `addReview(productId: ID!, userId: ID!, rating: Int!, comment: String)`: Add a new review for a product

## Federation Support

This service participates in the GraphQL Federation by:

- Defining the `Review` type as an entity with `@key(fields: "id")`
- Extending the `Product` type to add a `reviews` field
- Extending the `User` type to add a `reviews` field
- Implementing the `__resolveReference` function to resolve Review references from other services

## Running the Service

```bash
# Install dependencies
npm install

# Start the service
npm start

# Start in development mode (with auto-restart)
npm run dev
```

The service will be available at http://localhost:4004/graphql

## Environment Variables

- `PORT`: The port number to run the service (default: 4004)

You can create a `.env` file based on the `.env.example` to customize these variables.
