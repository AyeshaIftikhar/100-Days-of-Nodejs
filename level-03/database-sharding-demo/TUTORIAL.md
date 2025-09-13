# Understanding Database Sharding: A Comprehensive Tutorial

This document provides an in-depth explanation of database sharding concepts demonstrated in this project.

## Table of Contents

1. [Introduction to Database Sharding](#introduction-to-database-sharding)
2. [When to Consider Sharding](#when-to-consider-sharding)
3. [Sharding Architecture](#sharding-architecture)
4. [Sharding Strategies](#sharding-strategies)
5. [Sharding Keys](#sharding-keys)
6. [Challenges and Considerations](#challenges-and-considerations)
7. [MongoDB Sharding Implementation](#mongodb-sharding-implementation)
8. [Monitoring and Maintaining Sharded Databases](#monitoring-and-maintaining-sharded-databases)
9. [Real-World Examples](#real-world-examples)
10. [Further Reading](#further-reading)

## Introduction to Database Sharding

Database sharding is a horizontal partitioning technique that splits a large database into smaller, more manageable pieces called shards. Each shard is a separate database instance that holds a subset of the entire dataset. Collectively, all shards represent the complete dataset.

The primary goal of sharding is to distribute data and query loads across multiple servers, improving performance, scalability, and availability. By distributing data across multiple machines, sharding allows for parallel processing of queries, which can significantly reduce response times for read and write operations.

## When to Consider Sharding

Sharding is a complex architectural pattern that should be considered when:

1. **Data Volume Exceeds Single Server Capacity**: When your database size approaches or exceeds the capacity of a single server.

2. **Query Performance Degrades**: When query response times increase due to the large volume of data being processed.

3. **Write Throughput Bottlenecks**: When write operations become a bottleneck due to high transaction volumes.

4. **Geographical Distribution Needs**: When data needs to be physically located closer to users in different regions.

5. **High Availability Requirements**: When the application requires higher availability than what can be achieved with a single database instance.

## Sharding Architecture

A typical sharded database architecture consists of three main components:

### 1. Shard Servers

These are the individual database instances that store a portion of the data. Each shard is a complete, independent database server capable of handling queries related to its subset of data.

### 2. Config Servers

Config servers store metadata about the sharded cluster, including:
- The mapping of data chunks to shards
- Shard locations
- The sharding key ranges for each chunk

This metadata is critical for routing queries to the appropriate shards.

### 3. Router (Query Router)

The router is the entry point for client applications. It:
- Receives queries from the client
- Determines which shard(s) should handle each query based on the config server's metadata
- Routes queries to the appropriate shard(s)
- Merges results from multiple shards if necessary
- Returns a unified result to the client

In MongoDB, the router is called "mongos".

## Sharding Strategies

There are several strategies for distributing data across shards:

### Range-Based Sharding

Range-based sharding distributes data based on ranges of a shard key. For example:

- Shard 1: Records with IDs 1-1000
- Shard 2: Records with IDs 1001-2000
- Shard 3: Records with IDs 2001+

**Advantages:**
- Efficient for range queries
- Simple to understand and implement
- Provides control over data distribution

**Disadvantages:**
- Can lead to uneven data distribution ("hot spots") if the shard key values are not evenly distributed
- May require frequent rebalancing as data grows

### Hash-Based Sharding

Hash-based sharding applies a hash function to the shard key to determine which shard receives the data.

**Advantages:**
- More even data distribution
- Reduces the likelihood of "hot spots"
- Minimizes the need for rebalancing

**Disadvantages:**
- Range queries become inefficient as consecutive values may be stored on different shards
- More complex implementation

### Geographic Sharding

Geographic sharding distributes data based on geographic location.

**Advantages:**
- Improved latency for users in specific regions
- Compliance with data localization regulations
- Natural partition for geographically isolated data

**Disadvantages:**
- Complex implementation
- May lead to uneven data distribution
- Requires understanding of user access patterns

### Directory-Based Sharding

Directory-based sharding uses a lookup table to map shard keys to specific shards.

**Advantages:**
- Flexible mapping that can be updated
- Can optimize for complex access patterns
- Allows for manual tuning of data distribution

**Disadvantages:**
- Additional overhead for lookup
- More complex implementation
- Requires maintenance of the lookup table

## Sharding Keys

The choice of sharding key is crucial for effective sharding. A sharding key (or partition key) is a field or set of fields in the documents/records that determines how data is distributed across shards.

### Characteristics of a Good Sharding Key

1. **High Cardinality**: A large number of possible values to ensure even distribution.

2. **Low Frequency**: No single key value should be associated with a large portion of the data.

3. **Immutable**: Keys should not change over time to avoid costly document migrations.

4. **Query Inclusivity**: The key should be included in most queries to enable targeted shard access.

### Common Sharding Key Choices

- **User ID**: For user-centric applications where data is frequently accessed by user.
- **Timestamp**: For time-series data where recent data is accessed most frequently.
- **Geographic Location**: For location-based services.
- **Customer/Organization ID**: For multi-tenant applications.
- **Compound Keys**: Combination of fields that together provide better distribution characteristics.

## Challenges and Considerations

### 1. Joins Across Shards

Joins between collections/tables that span multiple shards can be inefficient and complex. Options to address this include:

- Denormalization
- Application-level joins
- Co-location of related data on the same shard

### 2. Transactions Across Shards

ACID transactions that span multiple shards are challenging to implement. Solutions include:

- Limiting transactions to a single shard
- Two-phase commit protocols
- Eventually consistent patterns

### 3. Schema Changes

Schema changes in a sharded environment require careful planning and execution to ensure consistency across all shards.

### 4. Rebalancing

As data grows or shard capacity changes, data may need to be redistributed across shards. This process, called rebalancing, can be resource-intensive and requires careful planning.

### 5. Backup and Recovery

Backing up and restoring a sharded database requires coordinating backups across multiple servers while maintaining consistency.

## MongoDB Sharding Implementation

MongoDB implements sharding through its built-in sharding capabilities. Here's an overview of how MongoDB sharding works:

### Components

1. **Shards**: Each shard is a replica set that holds a subset of the sharded data.
2. **Config Servers**: A replica set that stores metadata about the cluster.
3. **Mongos**: Query routers that direct operations to the appropriate shards.

### Implementation Steps

1. **Set Up Config Servers**:
   ```
   mongod --configsvr --replSet configRS --port 27019 --dbpath /data/configdb
   ```

2. **Initialize Config Server Replica Set**:
   ```
   rs.initiate({
     _id: "configRS",
     configsvr: true,
     members: [{ _id: 0, host: "localhost:27019" }]
   })
   ```

3. **Set Up Shard Replica Sets**:
   ```
   mongod --shardsvr --replSet shard1RS --port 27018 --dbpath /data/shard1
   ```

4. **Initialize Shard Replica Sets**:
   ```
   rs.initiate({
     _id: "shard1RS",
     members: [{ _id: 0, host: "localhost:27018" }]
   })
   ```

5. **Start Mongos Router**:
   ```
   mongos --configdb configRS/localhost:27019 --port 27017
   ```

6. **Add Shards to the Cluster**:
   ```
   sh.addShard("shard1RS/localhost:27018")
   sh.addShard("shard2RS/localhost:27028")
   sh.addShard("shard3RS/localhost:27038")
   ```

7. **Enable Sharding for a Database**:
   ```
   sh.enableSharding("myDatabase")
   ```

8. **Define Shard Key and Shard a Collection**:
   ```
   sh.shardCollection("myDatabase.myCollection", { shardKey: 1 })
   ```

### Chunk Migration

MongoDB automatically migrates chunks (portions of sharded data) between shards to maintain an even distribution. This process is managed by the balancer, which runs periodically to check for imbalances.

## Monitoring and Maintaining Sharded Databases

### Key Metrics to Monitor

1. **Chunk Distribution**: Ensure even distribution of chunks across shards.
2. **Query Performance**: Monitor query execution times across shards.
3. **Resource Utilization**: Track CPU, memory, disk I/O, and network utilization on each shard.
4. **Balancer Activity**: Monitor chunk migrations and their impact on performance.
5. **Connection Counts**: Track the number of connections to each shard.

### Maintenance Tasks

1. **Adding Shards**: As data grows, additional shards may be needed.
2. **Removing Shards**: If a shard needs to be decommissioned, its data must be migrated to other shards.
3. **Rebalancing**: Manually trigger rebalancing when needed.
4. **Index Management**: Ensure consistent indexes across all shards.
5. **Upgrading**: Coordinate upgrades across all components of the sharded cluster.

## Real-World Examples

### 1. Instagram

Instagram uses sharding to manage its massive volume of photos and user data. They shard their PostgreSQL databases by user ID, which allows them to scale horizontally as their user base grows.

### 2. Uber

Uber uses sharded MySQL databases to handle their geospatial data. They shard by geographic regions, allowing for efficient queries for riders and drivers in specific areas.

### 3. Twitter

Twitter uses a combination of sharding strategies to manage their massive data volume. They use a custom sharding approach called "Gizzard" that acts as a middleware between their application and the database shards.

### 4. Facebook

Facebook uses a custom sharding approach called "MySQL + Haystack" for photo storage and "TAO" for social graph data. They shard based on user IDs and object types to manage their enormous data volumes.

## Further Reading

1. [MongoDB Manual: Sharding](https://docs.mongodb.com/manual/sharding/)
2. [Database Sharding Explained](https://www.digitalocean.com/community/tutorials/understanding-database-sharding)
3. [Sharding Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/sharding)
4. [How Sharding Works](https://medium.com/@jeeyoungk/how-sharding-works-b4dec46b3f6)
5. [Database Sharding Best Practices](https://www.percona.com/blog/2019/05/24/an-overview-of-sharding-in-mongodb/)
6. [Sharding & IDs at Instagram](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c)
7. [Uber Engineering's Schemaless Datastore](https://eng.uber.com/schemaless-part-one/)
