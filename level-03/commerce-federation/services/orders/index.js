const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
require('dotenv').config();

// Sample orders data (in-memory database)
const orders = [
  {
    id: '1',
    userId: '1',
    orderDate: '2023-08-01T10:30:00Z',
    status: 'DELIVERED',
    productIds: ['1', '2'],
    totalAmount: 209.98
  },
  {
    id: '2',
    userId: '1',
    orderDate: '2023-08-15T14:20:00Z',
    status: 'PROCESSING',
    productIds: ['3', '4'],
    totalAmount: 249.98
  },
  {
    id: '3',
    userId: '2',
    orderDate: '2023-08-10T09:15:00Z',
    status: 'SHIPPED',
    productIds: ['5', '1'],
    totalAmount: 219.98
  }
];

// Define the GraphQL schema with federation directives
const typeDefs = gql`
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
`;

// Define resolvers
const resolvers = {
  Order: {
    __resolveReference(reference) {
      return orders.find(order => order.id === reference.id);
    },
    user(order) {
      return { __typename: 'User', id: order.userId };
    },
    products(order) {
      return order.productIds.map(id => ({ __typename: 'Product', id }));
    }
  },
  User: {
    orders(user) {
      return orders.filter(order => order.userId === user.id);
    }
  },
  Query: {
    orders: () => orders,
    order: (_, { id }) => orders.find(order => order.id === id),
    ordersByUser: (_, { userId }) => orders.filter(order => order.userId === userId)
  }
};

// Create the Apollo Server with the federated schema
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

// Start the server
const PORT = process.env.PORT || 4003;
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Orders service ready at ${url}`);
});
