const { gql } = require('apollo-server');

const typeDefs = gql`
 type Query {
    hello: String
    # ...other query fields
  }

  type User {
    id: ID!
    username: String!
    email: String!
    posts: [Post!]!
    comments: [Comment!]!
    createdAt: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
    createdAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
  }

  input PostInput {
    title: String!
    content: String!
  }

  input CommentInput {
    content: String!
    postId: ID!
  }

  type Query {
    # Auth
    me: User

    # Posts
    posts: [Post!]!
    post(id: ID!): Post

    # Comments
    comments(postId: ID!): [Comment!]!
  }

  type Mutation {
    # Auth
    signup(input: UserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Posts
    createPost(input: PostInput!): Post!
    updatePost(id: ID!, input: PostInput!): Post!
    deletePost(id: ID!): Boolean!

    # Comments
    createComment(input: CommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;