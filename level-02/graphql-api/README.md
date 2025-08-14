# GraphQL API with Apollo Server

## What is GraphQL
GraphQL is a query language and runtime for APIs that lets clients request exactly the data they need — no more, no less.
It was developed by Facebook in 2012 and released publicly in 2015.

Instead of the traditional REST API approach (multiple endpoints returning fixed data structures), GraphQL works with a single endpoint where the client specifies the shape and fields of the data they want.

## How It Works

- __Schema:__ The server defines a schema that describes all possible data types and the relationships between them.
- __Query:__ The client sends a query specifying exactly which fields they want from the schema.
- __Response:__ The server returns JSON matching the requested structure — nothing extra.

A modern GraphQL API implementation using Apollo Server with MongoDB for data persistence.

## Features

- GraphQL schema with types, queries, and mutations
- User authentication with JWT
- Blog post management
- Comment system
- Data relationships (users, posts, comments)
- Error handling
- MongoDB integration
- Apollo Server with playground

## GraphQL Operations

### Authentication

- `signup(input: UserInput!)`: Register a new user
- `login(email: String!, password: String!)`: Login with credentials
- `me`: Get current user data (protected)

### Posts

- `posts`: Get all posts
- `post(id: ID!)`: Get a single post
- `createPost(input: PostInput!)`: Create new post (protected)
- `updatePost(id: ID!, input: PostInput!)`: Update post (protected)
- `deletePost(id: ID!)`: Delete post (protected)

### Comments

- `comments(postId: ID!)`: Get comments for a post
- `createComment(input: CommentInput!)`: Add comment (protected)
- `deleteComment(id: ID!)`: Delete comment (protected)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Start MongoDB server
5. Run the application: `npm run dev`

## Environment Variables

- `PORT`: Server port (default: 4000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., "1d")

## Database Schema

### User

- id: ID!
- username: String!
- email: String!
- password: String! (hashed)
- posts: [Post!]!
- comments: [Comment!]!
- createdAt: String!

### Post

- id: ID!
- title: String!
- content: String!
- author: User!
- comments: [Comment!]!
- createdAt: String!

### Comment

- id: ID!
- content: String!
- author: User!
- post: Post!
- createdAt: String!

## Example Queries and Mutations

### Signup

```graphql
mutation {
  signup(
    input: {
      username: "testuser"
      email: "test@example.com"
      password: "password123"
    }
  ) {
    token
    user {
      id
      username
      email
    }
  }
}
```

```bash
npm install apollo-server graphql mongoose jsonwebtoken bcryptjs dotenv
npm install --save-dev nodemon
npm run dev // it will give the capability of hot reload
````
