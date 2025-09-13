#!/bin/bash
echo "Waiting for MongoDB services to start..."
sleep 30

echo "Initializing Config Server Replica Set..."
mongosh config-server:27017 --eval "rs.initiate({_id: 'configrs', configsvr: true, members: [{_id: 0, host: 'config-server:27017'}]})"

echo "Initializing Shard 1 Replica Set..."
mongosh shard1:27017 --eval "rs.initiate({_id: 'shard1rs', members: [{_id: 0, host: 'shard1:27017'}]})"

echo "Initializing Shard 2 Replica Set..."
mongosh shard2:27017 --eval "rs.initiate({_id: 'shard2rs', members: [{_id: 0, host: 'shard2:27017'}]})"

echo "Initializing Shard 3 Replica Set..."
mongosh shard3:27017 --eval "rs.initiate({_id: 'shard3rs', members: [{_id: 0, host: 'shard3:27017'}]})"

echo "Waiting for replica sets to initialize..."
sleep 30

echo "Adding shards to the cluster..."
mongosh mongos:27017 --eval "sh.addShard('shard1rs/shard1:27017')"
mongosh mongos:27017 --eval "sh.addShard('shard2rs/shard2:27017')"
mongosh mongos:27017 --eval "sh.addShard('shard3rs/shard3:27017')"

echo "Running initialization script..."
mongosh mongos:27017 < /scripts/init.js

echo "MongoDB sharded cluster setup completed!"
