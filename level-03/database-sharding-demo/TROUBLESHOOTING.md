# Troubleshooting Guide

This document provides solutions for common issues you might encounter while setting up and running the Database Sharding Demo project.

## Table of Contents

- [Docker and MongoDB Issues](#docker-and-mongodb-issues)
- [Backend Server Issues](#backend-server-issues)
- [Frontend Issues](#frontend-issues)
- [Sharding-Specific Issues](#sharding-specific-issues)
- [Performance Issues](#performance-issues)
- [Common Error Messages](#common-error-messages)

## Docker and MongoDB Issues

### Docker containers won't start

**Symptoms:**
- `npm run docker:up` fails
- Containers stop immediately after starting
- Docker compose shows errors

**Solutions:**

1. Check if the required ports are already in use:
   ```bash
   sudo lsof -i :27017,27117,27118,27119,27120
   ```

   If ports are in use, stop the processes using them or modify the port mappings in `docker-compose.yml`.

2. Check Docker logs:
   ```bash
   docker-compose logs
   ```

3. Ensure Docker has enough resources (memory, disk space):
   ```bash
   docker info
   df -h
   ```

4. Reset Docker environment:
   ```bash
   npm run docker:down
   docker volume prune
   docker system prune
   npm run docker:up
   ```

### MongoDB sharding not initializing properly

**Symptoms:**
- MongoDB starts but sharding is not configured
- Error messages about config servers or shards not being available

**Solutions:**

1. Check the initialization script logs:
   ```bash
   docker logs mongodb-init
   ```

2. Verify that all MongoDB containers are running:
   ```bash
   docker ps | grep mongo
   ```

3. Manually connect to mongos and check sharding status:
   ```bash
   docker exec -it mongos mongo
   sh.status()
   ```

4. Recreate the Docker environment:
   ```bash
   npm run docker:down
   docker volume rm $(docker volume ls -q | grep database-sharding-demo)
   npm run docker:up
   ```

### Connection issues with MongoDB

**Symptoms:**
- Backend can't connect to MongoDB
- Error messages about connection timeouts or refused connections

**Solutions:**

1. Verify that MongoDB is running:
   ```bash
   docker ps | grep mongo
   ```

2. Check MongoDB logs:
   ```bash
   docker logs mongos
   ```

3. Verify MongoDB connection string in the backend configuration:
   ```
   // Should be something like
   mongodb://localhost:27017/shardingDemo
   ```

4. Try connecting manually:
   ```bash
   docker exec -it mongos mongo
   ```

5. Check network settings in Docker Compose:
   ```bash
   docker network ls
   docker network inspect database-sharding-demo_default
   ```

## Backend Server Issues

### Backend server won't start

**Symptoms:**
- `npm run dev:server` fails
- Server crashes on startup
- Error messages in the console

**Solutions:**

1. Check for TypeScript compilation errors:
   ```bash
   cd server
   npm run build
   ```

2. Verify all dependencies are installed:
   ```bash
   cd server
   npm install
   ```

3. Check environment variables:
   ```bash
   cat server/.env
   ```
   
   Ensure it has the correct MongoDB URI and other required settings.

4. Check for port conflicts:
   ```bash
   sudo lsof -i :3000
   ```

   If port 3000 is in use, change the port in `server/src/config/index.ts`.

5. Clear the Node.js cache:
   ```bash
   cd server
   rm -rf node_modules/.cache
   ```

### API endpoints return errors

**Symptoms:**
- API requests return 500 errors
- Specific API endpoints fail
- Error messages in server logs

**Solutions:**

1. Check server logs:
   ```bash
   cat server/logs/app.log
   ```

2. Verify MongoDB connection:
   ```bash
   cd server
   npx ts-node src/utils/testDbConnection.ts
   ```

3. Check for schema validation errors:
   ```bash
   cd server
   npx ts-node src/utils/validateSchemas.ts
   ```

4. Verify that the collection is sharded correctly:
   ```bash
   docker exec -it mongos mongo
   use admin
   db.runCommand({ listShards: 1 })
   use shardingDemo
   db.transactions.getShardDistribution()
   ```

5. Restart the backend server:
   ```bash
   cd server
   npm run dev
   ```

## Frontend Issues

### Frontend development server won't start

**Symptoms:**
- `npm run dev:client` fails
- Vite errors in the console

**Solutions:**

1. Check for TypeScript compilation errors:
   ```bash
   cd client
   npm run build
   ```

2. Verify all dependencies are installed:
   ```bash
   cd client
   npm install
   ```

3. Check for port conflicts:
   ```bash
   sudo lsof -i :5173
   ```

   If port 5173 is in use, change the port in `client/vite.config.ts`.

4. Clear the Vite cache:
   ```bash
   cd client
   rm -rf node_modules/.vite
   ```

5. Check if Vite configuration is correct:
   ```bash
   cat client/vite.config.ts
   ```

### API requests from frontend fail

**Symptoms:**
- Frontend shows network errors
- Data doesn't load
- Console shows CORS or network errors

**Solutions:**

1. Verify that the backend server is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check for CORS issues:
   - Ensure the backend has CORS enabled for `http://localhost:5173`
   - Check browser console for CORS errors

3. Verify API endpoint URLs:
   ```bash
   cat client/src/lib/api.ts
   ```
   
   Ensure they point to the correct server address.

4. Check for authentication issues:
   - Clear browser cookies and local storage
   - Restart the browser

5. Use browser dev tools to debug network requests:
   - Open browser dev tools (F12)
   - Go to Network tab
   - Make the request and check for errors

## Sharding-Specific Issues

### Data not distributing across shards

**Symptoms:**
- All data seems to be on one shard
- Sharding statistics show uneven distribution
- Performance doesn't improve with more shards

**Solutions:**

1. Verify that collections are properly sharded:
   ```bash
   docker exec -it mongos mongo
   use admin
   sh.status()
   ```

2. Check shard key distribution:
   ```bash
   use shardingDemo
   db.users.getShardDistribution()
   db.products.getShardDistribution()
   db.transactions.getShardDistribution()
   ```

3. Ensure the balancer is running:
   ```bash
   use admin
   sh.getBalancerState()
   sh.isBalancerRunning()
   ```

   If not running, start it:
   ```bash
   sh.startBalancer()
   ```

4. Check for jumbo chunks that can't be moved:
   ```bash
   use config
   db.chunks.find({ jumbo: true })
   ```

5. Verify that your writes include the shard key:
   ```bash
   // Example for transactions with region shard key
   db.transactions.insertOne({
     userId: ObjectId(),
     productId: ObjectId(),
     amount: 100,
     status: "completed",
     region: "US-EAST",  // Include the shard key
     transactionDate: new Date()
   })
   ```

### Slow queries across shards

**Symptoms:**
- Queries are slower than expected
- Some queries are fast, others are slow
- MongoDB logs show scattered queries

**Solutions:**

1. Check if queries include the shard key:
   ```bash
   // Good - includes shard key
   db.transactions.find({ region: "US-EAST" })
   
   // Bad - doesn't include shard key, will query all shards
   db.transactions.find({ status: "completed" })
   ```

2. Add appropriate indexes:
   ```bash
   docker exec -it mongos mongo
   use shardingDemo
   db.transactions.createIndex({ status: 1 })
   ```

3. Check for query patterns that require scatter-gather:
   ```bash
   docker exec -it mongos mongo
   use shardingDemo
   db.transactions.find({ status: "completed" }).explain("executionStats")
   ```

4. Consider denormalizing data to avoid cross-shard queries:
   - Embed frequently accessed related data
   - Duplicate data across collections to avoid joins

5. Use the explain plan to analyze query performance:
   ```bash
   db.transactions.find({ status: "completed" }).explain("allPlansExecution")
   ```

### Rebalancing issues

**Symptoms:**
- Rebalancer doesn't migrate chunks
- Migration operations take too long
- Error messages about failed chunk migrations

**Solutions:**

1. Check balancer status:
   ```bash
   docker exec -it mongos mongo
   use admin
   sh.getBalancerState()
   sh.isBalancerRunning()
   ```

2. Check for active migrations:
   ```bash
   use admin
   db.adminCommand({ currentOp: true, $or: [{ active: true, type: "moveChunk" }, { active: true, type: "splitChunk" }] })
   ```

3. Check for locked chunks:
   ```bash
   use config
   db.chunks.find({ "locks": { $exists: true, $not: { $size: 0 } } })
   ```

4. Check for jumbo chunks:
   ```bash
   use config
   db.chunks.find({ jumbo: true })
   ```

   For jumbo chunks, you may need to manually split them:
   ```bash
   // Example for users collection
   use admin
   db.adminCommand({
     split: "shardingDemo.users",
     find: { _id: ObjectId("middle_of_chunk") }
   })
   ```

5. Check for network or resource constraints:
   - Monitor CPU, memory, disk I/O on all servers
   - Check network bandwidth between shards

## Performance Issues

### High CPU usage

**Symptoms:**
- Docker containers using high CPU
- Slow response times
- System becomes unresponsive

**Solutions:**

1. Check which containers are using high CPU:
   ```bash
   docker stats
   ```

2. Check for inefficient queries:
   ```bash
   docker exec -it mongos mongo
   use admin
   db.setProfilingLevel(1, 100)  // Log slow queries (>100ms)
   ```

   After running some operations:
   ```bash
   use shardingDemo
   db.system.profile.find().sort({ millis: -1 }).limit(10)
   ```

3. Optimize indexes:
   ```bash
   docker exec -it mongos mongo
   use shardingDemo
   db.users.getIndexes()
   ```

   Add missing indexes for common queries.

4. Reduce resource usage in Docker:
   ```bash
   docker-compose down
   ```
   
   Edit `docker-compose.yml` to add resource limits:
   ```yaml
   services:
     mongos:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

5. Check for background operations:
   ```bash
   docker exec -it mongos mongo
   use admin
   db.currentOp()
   ```

   Kill long-running operations if necessary:
   ```bash
   db.killOp(opId)
   ```

### Memory issues

**Symptoms:**
- Docker containers using high memory
- Containers being killed (OOM)
- System becomes slow or unresponsive

**Solutions:**

1. Check memory usage:
   ```bash
   docker stats
   ```

2. Optimize MongoDB memory usage:
   ```bash
   docker exec -it mongos mongo
   db.adminCommand({ getCmdLineOpts: 1 })
   ```

   Edit `docker-compose.yml` to add memory limits:
   ```yaml
   services:
     mongos:
       command: mongos --configdb configRS/config-server:27019 --port 27017 --wiredTigerCacheSizeGB 0.25
   ```

3. Check for memory leaks in the Node.js application:
   ```bash
   # Install heapdump
   cd server
   npm install heapdump
   ```

   Add code to generate heap dumps and analyze them.

4. Restart containers with memory issues:
   ```bash
   docker restart mongos
   ```

5. Increase system swap space (as a temporary measure):
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## Common Error Messages

### "MongoServerSelectionError: connection timed out"

**Cause:** MongoDB servers are not reachable.

**Solutions:**
1. Check if MongoDB containers are running:
   ```bash
   docker ps | grep mongo
   ```

2. Verify network settings:
   ```bash
   docker network inspect database-sharding-demo_default
   ```

3. Check MongoDB logs:
   ```bash
   docker logs mongos
   ```

4. Verify connection string:
   ```bash
   cat server/src/config/index.ts
   ```

### "Error: not master and slaveOk=false"

**Cause:** Attempting to write to a secondary node.

**Solutions:**
1. Connect to the primary node:
   ```bash
   docker exec -it mongos mongo
   rs.status()  // Find primary
   ```

2. Use replica set connection string with proper options:
   ```
   mongodb://localhost:27017/shardingDemo?replicaSet=rs0
   ```

3. Set slaveOk for read operations on secondaries:
   ```javascript
   db.getMongo().setReadPref('secondary')
   ```

### "Error: cannot run command ... when not the SyncSource"

**Cause:** Shard replica set synchronization issues.

**Solutions:**
1. Check replica set status:
   ```bash
   docker exec -it shard1 mongo
   rs.status()
   ```

2. Restart problematic shard:
   ```bash
   docker restart shard1
   ```

3. Reconfigure replica set if necessary:
   ```bash
   docker exec -it shard1 mongo
   rs.reconfig(rs.config(), {force: true})
   ```

### "Error: chunks out of order"

**Cause:** Chunk metadata inconsistency.

**Solutions:**
1. Check chunk distribution:
   ```bash
   docker exec -it mongos mongo
   use config
   db.chunks.find().sort({min: 1})
   ```

2. Refresh shard metadata:
   ```bash
   use admin
   db.runCommand({ flushRouterConfig: 1 })
   ```

3. If problems persist, you may need to rebuild the sharded cluster:
   ```bash
   npm run docker:down
   docker volume prune
   npm run docker:up
   ```

### "CORS error: Access-Control-Allow-Origin missing"

**Cause:** CORS is not properly configured on the backend.

**Solutions:**
1. Check CORS configuration:
   ```bash
   cat server/src/config/index.ts
   ```

2. Ensure the frontend origin is allowed:
   ```javascript
   // In server/src/app.ts or similar
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

3. Verify that the backend is sending the correct headers:
   ```bash
   curl -I -X OPTIONS http://localhost:3000/api/users
   ```

### "Error: chunk is jumbo and cannot be moved"

**Cause:** A chunk has grown too large to be moved.

**Solutions:**
1. Identify jumbo chunks:
   ```bash
   docker exec -it mongos mongo
   use config
   db.chunks.find({ jumbo: true })
   ```

2. Manually split the jumbo chunk:
   ```bash
   use admin
   db.adminCommand({
     split: "shardingDemo.users",
     middle: { _id: ObjectId("middle_value") }
   })
   ```

3. Unmark as jumbo (use with caution):
   ```bash
   use config
   db.chunks.update(
     { ns: "shardingDemo.users", jumbo: true },
     { $unset: { jumbo: "" } }
   )
   ```

4. Prevent future jumbo chunks by choosing a better shard key or pre-splitting chunks.

### "TypeError: Failed to fetch" in frontend

**Cause:** API endpoint is not reachable from the frontend.

**Solutions:**
1. Verify that the backend server is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check API URL configuration:
   ```bash
   cat client/src/lib/api.ts
   ```

3. Check for CORS issues in browser console.

4. Verify network connectivity between frontend and backend.

5. Check if the API endpoint actually exists:
   ```bash
   cat server/src/routes/index.ts
   ```

If you encounter issues not covered in this guide, please:

1. Check the project logs:
   ```bash
   cat server/logs/app.log
   docker logs mongos
   ```

2. Search the MongoDB documentation for specific error messages.

3. Check the project's GitHub issues to see if others have encountered the same problem.

4. Feel free to open a new issue with detailed information about the problem you're facing.
