# Node.js REST API with Swagger Documentation

A complete Node.js REST API project with Swagger documentation.

## What is Swagger?

Swagger is a powerful open-source framework for designing, building, documenting, and consuming RESTful APIs. It's now more commonly referred to as the OpenAPI Specification (OAS), which is the industry standard for REST API description.

## Key Components of Swagger/OpenAPI

- OpenAPI Specification: The standard format for describing REST APIs
- Swagger Tools: Various tools that work with OpenAPI specifications

## Features

- RESTful API endpoints
- Swagger documentation
- MongoDB integration (sample model)
- Error handling
- CORS support
- Environment variables
- Health check endpoint

## API Documentation

After starting the server, access the Swagger UI at:
http://localhost:3000/api-docs

## Available Scripts

- npm start: Start the production server
- npm run dev: Start the development server with nodemon
- npm test: Run tests

## API Endpoints

- GET /api/samples: Get all samples
- GET /api/samples/:id: Get a specific sample
- POST /api/samples: Create a new sample
- PUT /api/samples/:id: Update a sample
- DELETE /api/samples/:id: Delete a sample
- GET /health: Health check endpoint

## Future Enhancements

- Add authentication (JWT)
- Implement rate limiting
- Add request validation
- Implement caching
- Add more comprehensive tests
- Add logging
- Implement API versioning
- Add Docker support
- Implement CI/CD pipeline
- Add more detailed Swagger documentation

- Access the API at http://localhost:3000/api/samples
- Access Swagger documentation at http://localhost:3000/api-docs
