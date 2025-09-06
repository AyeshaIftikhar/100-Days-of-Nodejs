const { ApolloServer } = require('apollo-server');
const { ApolloGateway } = require('@apollo/gateway');
require('dotenv').config();

// Get service URLs from environment variables or use defaults
const PRODUCTS_URL = process.env.PRODUCTS_URL || 'http://localhost:4001';
const USERS_URL = process.env.USERS_URL || 'http://localhost:4002';
const ORDERS_URL = process.env.ORDERS_URL || 'http://localhost:4003';
const REVIEWS_URL = process.env.REVIEWS_URL || 'http://localhost:4004';
const PORT = process.env.PORT || 4000;

// Configure the gateway to use our services
const gateway = new ApolloGateway({
  serviceList: [
    { name: 'products', url: PRODUCTS_URL },
    { name: 'users', url: USERS_URL },
    { name: 'orders', url: ORDERS_URL },
    { name: 'reviews', url: REVIEWS_URL }
  ]
});

// Initialize the ApolloServer with the gateway
const server = new ApolloServer({
  gateway,
  subscriptions: false, // Federation doesn't support subscriptions yet
  context: ({ req }) => {
    // You can add authentication here in the future
    return { authorization: req.headers.authorization };
  }
});

// Start the server
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
  console.log(`Connected to services:
  - Products: ${PRODUCTS_URL}
  - Users: ${USERS_URL}
  - Orders: ${ORDERS_URL}
  - Reviews: ${REVIEWS_URL}`);
});
