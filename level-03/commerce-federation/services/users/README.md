# Users Service

This is the Users microservice for the Commerce Federation project. It's responsible for managing user accounts and authentication in the e-commerce platform.

## Features

- Exposes user data via GraphQL
- Federation support to integrate with other services
- Query users by ID or get all users
- Simple "me" query for the current user (simulated)
- In-memory database (for demonstration purposes)

## GraphQL Schema

The service defines the following GraphQL types:

```graphql
enum Role {
  CUSTOMER
  ADMIN
  GUEST
}

type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String!
  role: Role!
}

extend type Query {
  users: [User!]!
  user(id: ID!): User
  me: User
}
```

## Available Queries

- `users`: Get all users
- `user(id: ID!)`: Get a specific user by ID
- `me`: Get the current user (simulated)

## Federation Support

This service participates in the GraphQL Federation by:

- Defining the `User` type as an entity with `@key(fields: "id")`
- Implementing the `__resolveReference` function to resolve User references from other services

## Running the Service

```bash
# Install dependencies
npm install

# Start the service
npm start

# Start in development mode (with auto-restart)
npm run dev
```

The service will be available at http://localhost:4002/graphql

## Environment Variables

- `PORT`: The port number to run the service (default: 4002)

You can create a `.env` file based on the `.env.example` to customize these variables.
