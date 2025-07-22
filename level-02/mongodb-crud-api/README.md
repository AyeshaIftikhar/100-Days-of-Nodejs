## MongoDB CURD API

A complete implementation of a RESTful API for performing CRUD (Create, Read, Update, Delete) operations with MongoDB using Node.js, Express, and Mongoose.

## Features
- Full CRUD operations
- Data validation
- Pagination
- Sorting
- Error handling
- Environment configuration
- JWT authentication (optional)
- Docker support

## API Endpoints

- Products

  - `GET /api/v1/products` - Get all products (with pagination, filtering, sorting)
  - `GET /api/v1/products/:id` - Get single product
  - `POST /api/v1/products` - Create new product (requires auth)
  - `PUT /api/v1/products/:id` - Update product (requires auth)
  - `DELETE /api/v1/products/:id` - Delete product (requires auth)

- Example Requests

  - Get all products with pagination

  ```bash
  curl "http://localhost:3000/api/v1/products?page=1&limit=5"
  ```

  - Filter products (price greater than 100)

  ```bash
  curl "http://localhost:3000/api/v1/products?price[gt]=100"
  ```

  - Create a product (with auth)

  ```bash
  curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Smartphone",
  "price": 599.99,
  "description": "Latest model smartphone",
  "category": "electronics",
  "stock": 50
  }'
  ```

- Run with docker

```bash
docker-compose up --build
```
