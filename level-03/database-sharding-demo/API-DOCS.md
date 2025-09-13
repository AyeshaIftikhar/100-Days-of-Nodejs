# Database Sharding Demo - API Documentation

This document provides detailed information about the API endpoints available in the Database Sharding Demo project.

## Base URL

All API endpoints are relative to:

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication for demonstration purposes.

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was malformed or invalid
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An unexpected server error occurred

Error responses include a JSON object with the following structure:

```json
{
  "error": true,
  "message": "Description of the error",
  "details": {}  // Optional additional details
}
```

## API Endpoints

### Users

#### GET /users

Retrieves a paginated list of users.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sortBy` (optional): Field to sort by (default: "createdAt")
- `sortDirection` (optional): Direction to sort (values: "asc" or "desc", default: "desc")
- `search` (optional): Search term to filter results

**Response:**

```json
{
  "data": [
    {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "region": "US-EAST",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  },
  "shardInfo": {
    "shard": "shard1"
  }
}
```

#### GET /users/:userId

Retrieves a specific user by ID.

**Response:**

```json
{
  "data": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "region": "US-EAST",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "shardInfo": {
    "shard": "shard1"
  }
}
```

#### POST /users

Creates a new user.

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "region": "US-EAST"
}
```

**Response:**

```json
{
  "data": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "region": "US-EAST",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "shardInfo": {
    "shard": "shard1"
  }
}
```

### Products

#### GET /products

Retrieves a paginated list of products.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sortBy` (optional): Field to sort by (default: "createdAt")
- `sortDirection` (optional): Direction to sort (values: "asc" or "desc", default: "desc")
- `search` (optional): Search term to filter results
- `category` (optional): Filter by product category

**Response:**

```json
{
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "category": "electronics",
      "stockQuantity": 100,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 200,
    "page": 1,
    "pages": 20,
    "limit": 10
  },
  "shardInfo": {
    "shard": "shard2"
  }
}
```

#### GET /products/:productId

Retrieves a specific product by ID.

**Response:**

```json
{
  "data": {
    "_id": "product_id",
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category": "electronics",
    "stockQuantity": 100,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "shardInfo": {
    "shard": "shard2"
  }
}
```

#### POST /products

Creates a new product.

**Request Body:**

```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "category": "electronics",
  "stockQuantity": 100
}
```

**Response:**

```json
{
  "data": {
    "_id": "product_id",
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category": "electronics",
    "stockQuantity": 100,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "shardInfo": {
    "shard": "shard2"
  }
}
```

### Transactions

#### GET /transactions

Retrieves a paginated list of transactions.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sortBy` (optional): Field to sort by (default: "createdAt")
- `sortDirection` (optional): Direction to sort (values: "asc" or "desc", default: "desc")
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by transaction status
- `minAmount` (optional): Filter by minimum amount
- `maxAmount` (optional): Filter by maximum amount
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**

```json
{
  "data": [
    {
      "_id": "transaction_id",
      "userId": "user_id",
      "productId": "product_id",
      "amount": 99.99,
      "status": "completed",
      "paymentMethod": "credit_card",
      "transactionDate": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "pages": 50,
    "limit": 10
  },
  "shardInfo": {
    "shard": "shard3"
  }
}
```

#### GET /transactions/:transactionId

Retrieves a specific transaction by ID.

**Response:**

```json
{
  "data": {
    "_id": "transaction_id",
    "userId": "user_id",
    "productId": "product_id",
    "amount": 99.99,
    "status": "completed",
    "paymentMethod": "credit_card",
    "transactionDate": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "shardInfo": {
    "shard": "shard3"
  }
}
```

#### POST /transactions

Creates a new transaction.

**Request Body:**

```json
{
  "userId": "user_id",
  "productId": "product_id",
  "amount": 99.99,
  "status": "pending",
  "paymentMethod": "credit_card"
}
```

**Response:**

```json
{
  "data": {
    "_id": "transaction_id",
    "userId": "user_id",
    "productId": "product_id",
    "amount": 99.99,
    "status": "pending",
    "paymentMethod": "credit_card",
    "transactionDate": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "shardInfo": {
    "shard": "shard3"
  }
}
```

#### PATCH /transactions/:transactionId/status

Updates the status of a transaction.

**Request Body:**

```json
{
  "status": "completed"
}
```

**Response:**

```json
{
  "data": {
    "_id": "transaction_id",
    "userId": "user_id",
    "productId": "product_id",
    "amount": 99.99,
    "status": "completed",
    "paymentMethod": "credit_card",
    "transactionDate": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "shardInfo": {
    "shard": "shard3"
  }
}
```

### Shards

#### GET /shards

Retrieves information about current shards.

**Response:**

```json
{
  "data": [
    {
      "shardId": "shard1",
      "host": "localhost:27117",
      "status": "active",
      "collections": ["users", "products", "transactions"],
      "documentCount": 1500,
      "storageSize": "256MB"
    },
    {
      "shardId": "shard2",
      "host": "localhost:27118",
      "status": "active",
      "collections": ["users", "products", "transactions"],
      "documentCount": 1200,
      "storageSize": "220MB"
    },
    {
      "shardId": "shard3",
      "host": "localhost:27119",
      "status": "active",
      "collections": ["users", "products", "transactions"],
      "documentCount": 1800,
      "storageSize": "300MB"
    }
  ]
}
```

#### GET /shards/statistics

Retrieves shard statistics and data distribution.

**Response:**

```json
{
  "data": {
    "totalDocuments": 4500,
    "totalStorageSize": "776MB",
    "distributionByCollection": {
      "users": {
        "shard1": 500,
        "shard2": 400,
        "shard3": 600
      },
      "products": {
        "shard1": 400,
        "shard2": 300,
        "shard3": 500
      },
      "transactions": {
        "shard1": 600,
        "shard2": 500,
        "shard3": 700
      }
    },
    "distributionByRegion": {
      "US-EAST": {
        "shard1": 300,
        "shard2": 250,
        "shard3": 350
      },
      "US-WEST": {
        "shard1": 200,
        "shard2": 150,
        "shard3": 250
      },
      "EU": {
        "shard1": 400,
        "shard2": 350,
        "shard3": 450
      },
      "ASIA": {
        "shard1": 600,
        "shard2": 450,
        "shard3": 750
      }
    }
  }
}
```

#### GET /shards/performance

Retrieves performance metrics for shards.

**Query Parameters:**
- `period` (optional): Time period for metrics (values: "hour", "day", "week", default: "hour")

**Response:**

```json
{
  "data": {
    "queryTimeAverage": {
      "shard1": 25,
      "shard2": 28,
      "shard3": 22
    },
    "queriesPerSecond": {
      "shard1": 12.5,
      "shard2": 10.2,
      "shard3": 15.8
    },
    "responseTime": {
      "shard1": 45,
      "shard2": 48,
      "shard3": 42
    },
    "cpuUsage": {
      "shard1": 35,
      "shard2": 40,
      "shard3": 30
    },
    "memoryUsage": {
      "shard1": 65,
      "shard2": 60,
      "shard3": 70
    }
  }
}
```

#### POST /shards/rebalance

Triggers shard rebalancing.

**Response:**

```json
{
  "data": {
    "rebalanceId": "rebalance_id",
    "status": "initiated",
    "message": "Rebalancing process initiated",
    "estimatedTimeSeconds": 120
  }
}
```

#### GET /shards/rebalance/:rebalanceId

Retrieves the status of a rebalancing operation.

**Response:**

```json
{
  "data": {
    "rebalanceId": "rebalance_id",
    "status": "in_progress",
    "progress": 45,
    "message": "Moving data chunks between shards",
    "startTime": "2023-01-01T00:00:00.000Z",
    "estimatedCompletionTime": "2023-01-01T00:02:00.000Z"
  }
}
```

## Data Generator Endpoints

### POST /data-generator/users

Generates sample user data.

**Request Body:**

```json
{
  "count": 100,
  "region": "US-EAST"  // Optional: specify region
}
```

**Response:**

```json
{
  "data": {
    "count": 100,
    "message": "Sample users generated successfully",
    "shardDistribution": {
      "shard1": 35,
      "shard2": 28,
      "shard3": 37
    }
  }
}
```

### POST /data-generator/products

Generates sample product data.

**Request Body:**

```json
{
  "count": 50,
  "category": "electronics"  // Optional: specify category
}
```

**Response:**

```json
{
  "data": {
    "count": 50,
    "message": "Sample products generated successfully",
    "shardDistribution": {
      "shard1": 18,
      "shard2": 15,
      "shard3": 17
    }
  }
}
```

### POST /data-generator/transactions

Generates sample transaction data.

**Request Body:**

```json
{
  "count": 200,
  "minAmount": 10,
  "maxAmount": 1000
}
```

**Response:**

```json
{
  "data": {
    "count": 200,
    "message": "Sample transactions generated successfully",
    "shardDistribution": {
      "shard1": 65,
      "shard2": 72,
      "shard3": 63
    }
  }
}
```

## Query Builder Endpoints

### POST /query-builder/execute

Executes a custom query against the sharded database.

**Request Body:**

```json
{
  "collection": "users",
  "query": {
    "region": "US-EAST"
  },
  "projection": {
    "username": 1,
    "email": 1,
    "region": 1
  },
  "sort": {
    "createdAt": -1
  },
  "limit": 10,
  "skip": 0,
  "showExecutionStats": true
}
```

**Response:**

```json
{
  "data": [
    {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "region": "US-EAST"
    }
  ],
  "executionStats": {
    "executionTimeMillis": 15,
    "totalKeysExamined": 100,
    "totalDocsExamined": 100,
    "nReturned": 10,
    "executionStages": {}
  },
  "shardInfo": {
    "shard1": {
      "executionTimeMillis": 5,
      "docsExamined": 40,
      "docsReturned": 4
    },
    "shard2": {
      "executionTimeMillis": 4,
      "docsExamined": 30,
      "docsReturned": 3
    },
    "shard3": {
      "executionTimeMillis": 6,
      "docsExamined": 30,
      "docsReturned": 3
    }
  }
}
```

## Websocket API

The application also provides real-time updates via WebSocket connections.

### Connection

Connect to:

```
ws://localhost:3000/ws
```

### Events

#### shard-stats

Real-time updates of shard statistics.

```json
{
  "event": "shard-stats",
  "data": {
    "timestamp": "2023-01-01T00:00:00.000Z",
    "stats": {
      "shard1": {
        "queries": 15,
        "responseTime": 45,
        "cpuUsage": 35,
        "memoryUsage": 65
      },
      "shard2": {
        "queries": 12,
        "responseTime": 48,
        "cpuUsage": 40,
        "memoryUsage": 60
      },
      "shard3": {
        "queries": 18,
        "responseTime": 42,
        "cpuUsage": 30,
        "memoryUsage": 70
      }
    }
  }
}
```

#### rebalance-progress

Real-time updates during rebalancing operations.

```json
{
  "event": "rebalance-progress",
  "data": {
    "rebalanceId": "rebalance_id",
    "status": "in_progress",
    "progress": 45,
    "message": "Moving data chunks between shards",
    "details": {
      "chunksProcessed": 45,
      "totalChunks": 100,
      "currentShard": "shard1",
      "targetShard": "shard3"
    }
  }
}
```

#### new-document

Notification when a new document is added to any collection.

```json
{
  "event": "new-document",
  "data": {
    "collection": "users",
    "documentId": "user_id",
    "shard": "shard1",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```
