const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
require('dotenv').config();

// Sample reviews data (in-memory database)
const reviews = [
  {
    id: '1',
    productId: '1',
    userId: '1',
    rating: 5,
    comment: 'Great keyboard! Love the mechanical switches.',
    createdAt: '2023-07-15T08:30:00Z'
  },
  {
    id: '2',
    productId: '1',
    userId: '2',
    rating: 4,
    comment: 'Good keyboard but a bit loud for my taste.',
    createdAt: '2023-07-20T14:20:00Z'
  },
  {
    id: '3',
    productId: '2',
    userId: '1',
    rating: 5,
    comment: 'Very comfortable mouse for long working hours.',
    createdAt: '2023-07-22T11:15:00Z'
  },
  {
    id: '4',
    productId: '3',
    userId: '2',
    rating: 3,
    comment: 'Battery life could be better, but otherwise good.',
    createdAt: '2023-08-01T09:45:00Z'
  },
  {
    id: '5',
    productId: '5',
    userId: '1',
    rating: 5,
    comment: 'Amazing sound quality and noise cancellation!',
    createdAt: '2023-08-05T16:30:00Z'
  }
];

// Define the GraphQL schema with federation directives
const typeDefs = gql`
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
`;

// Define resolvers
const resolvers = {
  Review: {
    __resolveReference(reference) {
      return reviews.find(review => review.id === reference.id);
    },
    product(review) {
      return { __typename: 'Product', id: review.productId };
    },
    user(review) {
      return { __typename: 'User', id: review.userId };
    }
  },
  Product: {
    reviews(product) {
      return reviews.filter(review => review.productId === product.id);
    }
  },
  User: {
    reviews(user) {
      return reviews.filter(review => review.userId === user.id);
    }
  },
  Query: {
    reviews: () => reviews,
    review: (_, { id }) => reviews.find(review => review.id === id),
    reviewsByProduct: (_, { productId }) => 
      reviews.filter(review => review.productId === productId),
    reviewsByUser: (_, { userId }) => 
      reviews.filter(review => review.userId === userId)
  },
  Mutation: {
    addReview: (_, { productId, userId, rating, comment }) => {
      const newReview = {
        id: String(reviews.length + 1),
        productId,
        userId,
        rating,
        comment,
        createdAt: new Date().toISOString()
      };
      reviews.push(newReview);
      return newReview;
    }
  }
};

// Create the Apollo Server with the federated schema
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

// Start the server
const PORT = process.env.PORT || 4004;
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Reviews service ready at ${url}`);
});
