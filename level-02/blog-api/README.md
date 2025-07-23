# RESTful Blog API with Express and MySQL

A complete RESTful API for a blogging platform built with Node.js, Express, and MySQL.

## Features

- User authentication (JWT)
- Blog post management (CRUD operations)
- Comments on posts
- Input validation
- Error handling
- Secure password storage
- MySQL database integration
- RESTful API design

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password

### Posts

- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get a single post
- `POST /api/v1/posts` - Create a new post (protected)
- `PATCH /api/v1/posts/:id` - Update a post (protected)
- `DELETE /api/v1/posts/:id` - Delete a post (protected)
- `GET /api/v1/posts/user/me` - Get all posts by the current user (protected)

### Comments

- `GET /api/v1/comments/:postId` - Get all comments for a post
- `POST /api/v1/comments/:postId` - Add a comment to a post (protected)
- `DELETE /api/v1/comments/:postId/:id` - Delete a comment (protected)

## Database Schema

### Users

- id (INT, PK, AUTO_INCREMENT)
- username (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Posts

- id (INT, PK, AUTO_INCREMENT)
- title (VARCHAR)
- content (TEXT)
- user_id (INT, FK to users.id)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Comments

- id (INT, PK, AUTO_INCREMENT)
- content (TEXT)
- post_id (INT, FK to posts.id)
- user_id (INT, FK to users.id)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Set up your MySQL database and update the connection details in `.env`
5. Run the database migrations (see below)
6. Start the server: `npm run dev`

## Database Setup

Run these SQL commands to set up your database:

```sql
CREATE DATABASE blog_db;

USE blog_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

```

blog-api/
├── src/
│ ├── config/
│ │ ├── db.js
│ │ └── jwt.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── postController.js
│ │ └── commentController.js
│ ├── middleware/
│ │ ├── auth.js
│ │ ├── error.js
│ │ └── validate.js
│ ├── models/
│ │ ├── User.js
│ │ ├── Post.js
│ │ └── Comment.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── postRoutes.js
│ │ └── commentRoutes.js
│ ├── services/
│ │ └── dbService.js
│ ├── utils/
│ │ ├── apiError.js
│ │ └── asyncHandler.js
│ └── app.js
├── .env
├── .gitignore
├── package.json
└── README.md

````

```bash
npm install express mysql2 jsonwebtoken bcryptjs dotenv cors helmet
npm install --save-dev nodemon
````
