const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
require('dotenv').config();

// Sample users data (in-memory database)
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'CUSTOMER'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'CUSTOMER'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN'
  }
];

// Define the GraphQL schema with federation directives
const typeDefs = gql`
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
`;

// Define resolvers
const resolvers = {
  User: {
    __resolveReference(reference) {
      return users.find(user => user.id === reference.id);
    }
  },
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(user => user.id === id),
    me: () => users[0] // Simulate current logged-in user
  }
};

// Create the Apollo Server with the federated schema
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

// Start the server
const PORT = process.env.PORT || 4002;
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Users service ready at ${url}`);
});
