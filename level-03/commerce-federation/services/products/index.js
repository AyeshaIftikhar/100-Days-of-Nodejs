const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
require('dotenv').config();

// Sample products data (in-memory database)
const products = [
  {
    id: '1',
    name: 'Mechanical Keyboard',
    price: 129.99,
    description: 'RGB backlit mechanical keyboard with cherry MX switches',
    category: 'ELECTRONICS',
    inStock: true
  },
  {
    id: '2',
    name: 'Ergonomic Mouse',
    price: 79.99,
    description: 'Wireless ergonomic mouse with customizable buttons',
    category: 'ELECTRONICS',
    inStock: true
  },
  {
    id: '3',
    name: 'Smart Watch',
    price: 199.99,
    description: 'Fitness tracking smartwatch with heart rate monitor',
    category: 'ELECTRONICS',
    inStock: false
  },
  {
    id: '4',
    name: 'Laptop Backpack',
    price: 49.99,
    description: 'Water-resistant backpack with laptop compartment',
    category: 'ACCESSORIES',
    inStock: true
  },
  {
    id: '5',
    name: 'Wireless Earbuds',
    price: 89.99,
    description: 'Noise-cancelling wireless earbuds with charging case',
    category: 'ELECTRONICS',
    inStock: true
  }
];

// Define the GraphQL schema with federation directives
const typeDefs = gql`
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
`;

// Define resolvers
const resolvers = {
  Product: {
    __resolveReference(reference) {
      return products.find(product => product.id === reference.id);
    }
  },
  Query: {
    products: () => products,
    product: (_, { id }) => products.find(product => product.id === id),
    productsByCategory: (_, { category }) => 
      products.filter(product => product.category === category)
  }
};

// Create the Apollo Server with the federated schema
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

// Start the server
const PORT = process.env.PORT || 4001;
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Products service ready at ${url}`);
});
