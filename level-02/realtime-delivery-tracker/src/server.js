// src/server.js
import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema.js';

const yoga = createYoga({
  schema,
  // GraphiQL supports subscriptions out of the box in Yoga
  graphqlEndpoint: '/graphql',
  maskedErrors: false
});

const server = createServer(yoga);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 GraphQL endpoint ready at http://localhost:${PORT}/graphql`);
  console.log(`🔌 Subscriptions via WebSocket & SSE on the same endpoint`);
});
