# Database Schema and Architecture

This document outlines the database schema and architecture used in the Database Sharding Demo project.

## MongoDB Sharded Cluster Architecture

The project uses a MongoDB sharded cluster with the following components:

```
                    +----------------+
                    |  Application   |
                    +--------+-------+
                             |
                             v
                    +----------------+
                    |     mongos     |  (Router)
                    +--------+-------+
                             |
                   +---------+---------+
                   |                   |
          +--------v------+   +--------v------+
          | Config Server |   | Config Server |  (Replica Set)
          +---------------+   +---------------+
                   |                   |
        +----------+-----------+-------+----------+
        |          |           |                  |
+-------v----+ +---v-------+ +-v---------+  +----v------+
|   Shard 1  | |  Shard 2  | |  Shard 3  |  |  Shard N  |  (Each a Replica Set)
+------------+ +-----------+ +-----------+  +-----------+
```

### Components

1. **Mongos Router**:
   - Acts as the query router
   - Directs client requests to the appropriate shard(s)
   - Merges results from multiple shards when necessary

2. **Config Servers**:
   - Store metadata and configuration settings for the cluster
   - Maintain information about chunk distribution
   - Track which shard contains which data

3. **Shard Servers**:
   - Each shard is a separate MongoDB instance
   - Each shard contains a subset of the sharded data
   - In production, each shard would be a replica set for high availability

## Database Collections

The demo application uses the following collections, each with its own sharding strategy:

### Users Collection

```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  region: string;  // e.g., "US-EAST", "US-WEST", "EU", "ASIA"
  createdAt: Date;
  updatedAt: Date;
}
```

**Sharding Strategy**: Range-based sharding by `_id`

**Shard Key**: `{ _id: 1 }`

**Indexes**:
- `{ _id: 1 }` (default, primary key)
- `{ username: 1 }` (unique)
- `{ email: 1 }` (unique)
- `{ region: 1 }` (for region-based queries)
- `{ createdAt: -1 }` (for sorting by creation date)

### Products Collection

```typescript
interface Product {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Sharding Strategy**: Hash-based sharding by `_id`

**Shard Key**: `{ _id: "hashed" }`

**Indexes**:
- `{ _id: 1 }` (default, primary key)
- `{ name: 1 }` (for product searches)
- `{ category: 1 }` (for category filtering)
- `{ price: 1 }` (for price-based queries)
- `{ createdAt: -1 }` (for sorting by creation date)

### Transactions Collection

```typescript
interface Transaction {
  _id: ObjectId;
  userId: ObjectId;
  productId: ObjectId;
  amount: number;
  status: string;  // "pending", "completed", "failed", "refunded"
  paymentMethod: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Sharding Strategy**: Geographic sharding by `region` (derived from user's region)

**Shard Key**: `{ region: 1, _id: 1 }`

**Indexes**:
- `{ _id: 1 }` (default, primary key)
- `{ userId: 1 }` (for user-based queries)
- `{ productId: 1 }` (for product-based queries)
- `{ status: 1 }` (for status filtering)
- `{ transactionDate: -1 }` (for date-based queries)
- `{ region: 1, _id: 1 }` (shard key, for efficient routing)

### ShardStatus Collection

```typescript
interface ShardStatus {
  _id: ObjectId;
  shardId: string;
  host: string;
  status: string;  // "active", "down", "maintenance"
  collections: string[];
  documentCount: number;
  storageSize: number;
  timestamp: Date;
}
```

**Not Sharded**: This collection is small and used for monitoring purposes

**Indexes**:
- `{ _id: 1 }` (default, primary key)
- `{ shardId: 1 }` (unique)
- `{ timestamp: -1 }` (for time-series queries)

## Sharding Implementation

### Enabling Sharding on the Database

```javascript
// Connect to mongos
use admin
db.runCommand({ enableSharding: "shardingDemo" })
```

### Sharding the Users Collection (Range-Based)

```javascript
// Create index on the shard key
use shardingDemo
db.users.createIndex({ _id: 1 })

// Shard the collection
db.adminCommand({
  shardCollection: "shardingDemo.users",
  key: { _id: 1 }
})
```

### Sharding the Products Collection (Hash-Based)

```javascript
// Create index on the shard key
use shardingDemo
db.products.createIndex({ _id: "hashed" })

// Shard the collection
db.adminCommand({
  shardCollection: "shardingDemo.products",
  key: { _id: "hashed" }
})
```

### Sharding the Transactions Collection (Geographic)

```javascript
// Create compound index on the shard key
use shardingDemo
db.transactions.createIndex({ region: 1, _id: 1 })

// Shard the collection
db.adminCommand({
  shardCollection: "shardingDemo.transactions",
  key: { region: 1, _id: 1 }
})

// Create zone for each region
db.adminCommand({ addShardToZone: "shard1", zone: "US-EAST" })
db.adminCommand({ addShardToZone: "shard2", zone: "US-WEST" })
db.adminCommand({ addShardToZone: "shard3", zone: "EU" })

// Create range for each zone
db.adminCommand({
  updateZoneKeyRange: "shardingDemo.transactions",
  min: { region: "US-EAST", _id: MinKey },
  max: { region: "US-EAST", _id: MaxKey },
  zone: "US-EAST"
})

db.adminCommand({
  updateZoneKeyRange: "shardingDemo.transactions",
  min: { region: "US-WEST", _id: MinKey },
  max: { region: "US-WEST", _id: MaxKey },
  zone: "US-WEST"
})

db.adminCommand({
  updateZoneKeyRange: "shardingDemo.transactions",
  min: { region: "EU", _id: MinKey },
  max: { region: "EU", _id: MaxKey },
  zone: "EU"
})
```

## Chunk Management

MongoDB splits data into chunks (approximately 64MB by default). The balancer process, which runs on the primary config server, is responsible for migrating chunks between shards to ensure an even distribution.

### Chunk Distribution Visualization

```
+-------------+     +-------------+     +-------------+
|   Shard 1   |     |   Shard 2   |     |   Shard 3   |
+-------------+     +-------------+     +-------------+
| Users:      |     | Users:      |     | Users:      |
| - Chunk 1   |     | - Chunk 3   |     | - Chunk 5   |
| - Chunk 2   |     | - Chunk 4   |     | - Chunk 6   |
|             |     |             |     |             |
| Products:   |     | Products:   |     | Products:   |
| - Chunk 7   |     | - Chunk 9   |     | - Chunk 11  |
| - Chunk 8   |     | - Chunk 10  |     | - Chunk 12  |
|             |     |             |     |             |
| Transactions:|    | Transactions:|    | Transactions:|
| - US-EAST   |     | - US-WEST   |     | - EU        |
| - ASIA      |     |             |     |             |
+-------------+     +-------------+     +-------------+
```

## Data Access Patterns

### User Data Access

- **Common Queries**:
  - Get user by ID
  - Get users by region
  - Get recently created users

- **Query Routing**:
  ```javascript
  // Gets routed to the specific shard containing the user
  db.users.findOne({ _id: ObjectId("...") })
  
  // May need to query multiple shards
  db.users.find({ region: "US-EAST" })
  
  // May need to query all shards and merge results
  db.users.find().sort({ createdAt: -1 }).limit(10)
  ```

### Product Data Access

- **Common Queries**:
  - Get product by ID
  - Get products by category
  - Get products by price range

- **Query Routing**:
  ```javascript
  // Gets routed to a specific shard based on the hashed _id
  db.products.findOne({ _id: ObjectId("...") })
  
  // Will need to query all shards (scattered query)
  db.products.find({ category: "electronics" })
  
  // Will need to query all shards (scattered query)
  db.products.find({ price: { $gte: 10, $lte: 100 } })
  ```

### Transaction Data Access

- **Common Queries**:
  - Get transaction by ID
  - Get transactions by user
  - Get transactions by region and date range

- **Query Routing**:
  ```javascript
  // May need to query multiple shards if the region is unknown
  db.transactions.findOne({ _id: ObjectId("...") })
  
  // Will need to query all shards (scattered query)
  db.transactions.find({ userId: ObjectId("...") })
  
  // Gets routed to the specific shard for that region
  db.transactions.find({ 
    region: "US-EAST", 
    transactionDate: { $gte: ISODate("2023-01-01"), $lte: ISODate("2023-01-31") } 
  })
  ```

## Performance Considerations

### Advantages of Sharding

1. **Horizontal Scalability**: Ability to add more shards as data volume increases
2. **Improved Query Performance**: Parallel processing of queries across multiple shards
3. **Increased Storage Capacity**: Combined storage space of all shards
4. **Better Write Performance**: Distributed write operations

### Potential Challenges

1. **Scattered Queries**: Queries that don't include the shard key may need to query all shards
2. **Jumbo Chunks**: Very large chunks that cannot be split or moved
3. **Balancer Overhead**: The balancing process can impact performance
4. **Complexity**: Increased operational complexity compared to a single database

## Monitoring and Maintenance

The application includes a monitoring dashboard that displays:

1. **Chunk Distribution**: Number of chunks per shard
2. **Query Performance**: Response times for different query types
3. **Resource Utilization**: CPU, memory, and disk usage per shard
4. **Balancer Activity**: Ongoing chunk migrations

### Common Maintenance Tasks

1. **Adding a New Shard**:
   ```javascript
   sh.addShard("shard4/localhost:27120")
   ```

2. **Rebalancing Chunks**:
   ```javascript
   // Start the balancer if it's not running
   sh.startBalancer()
   ```

3. **Removing a Shard**:
   ```javascript
   // This will migrate all data off the shard before removing it
   db.adminCommand({ removeShard: "shard1" })
   ```

4. **Analyzing Shard Distribution**:
   ```javascript
   db.transactions.getShardDistribution()
   ```

## Conclusion

The sharding architecture implemented in this demo project showcases three different sharding strategies:

1. **Range-Based Sharding**: For the Users collection, demonstrating how to shard by _id ranges
2. **Hash-Based Sharding**: For the Products collection, showing even distribution using hashed shard keys
3. **Geographic Sharding**: For the Transactions collection, illustrating location-based sharding with zones

Each strategy has its own strengths and use cases, making this demo a comprehensive illustration of MongoDB's sharding capabilities.
