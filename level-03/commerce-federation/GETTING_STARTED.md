# Getting Started with Commerce Federation

This guide will help you set up and run the Commerce Federation GraphQL microservices project.

## Step 1: Clone the Repository

If you haven't already, clone the repository and navigate to the commerce-federation directory:

```bash
git clone <repository-url>
cd commerce-federation
```

## Step 2: Install Dependencies

Install the dependencies for each service and the root project:

```bash
# Install root dependencies
npm install

# Install all service dependencies at once
npm run install:all
```

## Step 3: Configure Environment Variables

Create `.env` files in each service directory based on the `.env.example` files:

```bash
# For Gateway
cp gateway/.env.example gateway/.env

# For Products Service
cp services/products/.env.example services/products/.env

# For Users Service
cp services/users/.env.example services/users/.env

# For Orders Service
cp services/orders/.env.example services/orders/.env

# For Reviews Service
cp services/reviews/.env.example services/reviews/.env
```

## Step 4: Running the Services

You can run all services simultaneously:

```bash
npm run start:all
```

Or run them individually:

```bash
# Run gateway
npm run start:gateway

# Run products service
npm run start:products

# Run users service
npm run start:users

# Run orders service
npm run start:orders

# Run reviews service
npm run start:reviews
```

For development with automatic restart on code changes:

```bash
npm run dev
```

## Step 5: Accessing the GraphQL Playground

Once all services are running, you can access the GraphQL Playground at:

```
http://localhost:4000/graphql
```

## Step 6: Using Docker (Optional)

If you prefer to use Docker:

```bash
# Build and start all services
docker-compose up

# Build and start in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

## Example Queries

Here are some example queries to try in the GraphQL Playground:

### Get all products with reviews

```graphql
query {
  products {
    id
    name
    price
    description
    reviews {
      id
      rating
      comment
      user {
        id
        name
      }
    }
  }
}
```

### Get a user with their orders and the products in each order

```graphql
query {
  user(id: "1") {
    id
    name
    email
    orders {
      id
      orderDate
      status
      products {
        id
        name
        price
      }
      totalAmount
    }
  }
}
```

### Get all reviews for a specific product

```graphql
query {
  reviewsByProduct(productId: "1") {
    id
    rating
    comment
    createdAt
    user {
      id
      name
    }
  }
}
```

## Troubleshooting

If you encounter any issues:

1. Make sure all services are running
2. Check console logs for errors
3. Verify that the services are running on the correct ports
4. Ensure you've set up the environment variables correctly

If a service fails to start, try running it individually to see the error messages.
