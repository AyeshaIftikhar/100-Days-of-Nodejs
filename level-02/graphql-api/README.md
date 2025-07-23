# GraphQL API with Apollo Server

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
  signup(input: {
    username: "testuser",
    email: "test@example.com",
    password: "password123"
  }) {
    token
    user {
      id
      username
      email
    }
  }
}

```
graphql-api/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── jwt.js
│   ├── graphql/
│   │   ├── schema/
│   │   │   ├── typeDefs.js
│   │   │   └── index.js
│   │   ├── resolvers/
│   │   │   ├── authResolvers.js
│   │   │   ├── postResolvers.js
│   │   │   ├── commentResolvers.js
│   │   │   └── index.js
│   │   ├── context.js
│   │   └── dataSources/
│   │       ├── UserAPI.js
│   │       ├── PostAPI.js
│   │       └── CommentAPI.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

```bash
npm install apollo-server graphql mongoose jsonwebtoken bcryptjs dotenv
npm install --save-dev nodemon
```
