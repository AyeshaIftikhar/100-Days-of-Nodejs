# Low-Code API Builder

A powerful Node.js platform for building, deploying, and managing RESTful APIs without writing extensive code. This tool is designed for developers, product managers, and business users who need to rapidly prototype and deploy APIs.

## 🚀 Features

- **Visual API Designer**: Design APIs with an intuitive UI
- **Auto-Generated CRUD Operations**: Automatic endpoints for database models
- **Custom Logic Support**: Add custom middleware and business logic
- **Authentication & Authorization**: Built-in user management and access control
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Validation**: Request validation using Joi
- **MongoDB Integration**: Seamless integration with MongoDB
- **Extensible Architecture**: Add new data sources or auth providers

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd low-code-api-builder
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables by creating a `.env` file
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/low-code-api
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development server
```bash
npm run dev
```

## 🔧 Usage

### Creating a New API

1. Access the web interface at `http://localhost:3000/admin`
2. Log in with default credentials (admin/admin)
3. Create a new API by defining:
   - API name and description
   - Data model (fields, types, validations)
   - Access control settings
   - Custom logic (optional)
4. Click "Deploy API" to make it live

### Accessing Your API

Your new API will be available at:
```
http://localhost:3000/api/v1/{api-name}
```

### API Documentation

Auto-generated Swagger documentation is available at:
```
http://localhost:3000/api-docs
```

## 🏗️ Project Structure

```
low-code-api-builder/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── validators/       # Input validation schemas
│   └── server.js         # Application entry point
├── public/               # Static files (admin UI)
├── tests/                # Test files
├── .env                  # Environment variables
└── package.json          # Project metadata
```

## 🧪 Testing

```bash
npm test
```

## 🔒 Security

- All API endpoints support JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Joi

## 🔮 Future Enhancements

1. **GraphQL Support**: Add ability to generate GraphQL APIs
2. **Multiple Database Support**: Add support for PostgreSQL, MySQL, etc.
3. **Serverless Deployment**: Enable deployment to AWS Lambda, Vercel, etc.
4. **OAuth Integration**: Add support for OAuth providers
5. **Webhooks**: Add webhook support for event notifications
6. **API Versioning**: Support for multiple API versions
7. **Rate Limiting**: Add configurable rate limiting
8. **Caching Layer**: Add Redis caching integration
9. **Export/Import**: Allow exporting and importing API configurations
10. **Custom Domain Support**: Map APIs to custom domains

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
