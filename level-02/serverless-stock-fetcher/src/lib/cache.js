const { LRUCache } = require('lru-cache');
const config = require('../utils/config');
const logger = require('../utils/logger');

class MemoryCache {
  constructor() {
    this.cache = new LRUCache({
      max: 500,
      ttl: config.cacheTtl * 1000
    });
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value, ttl = config.cacheTtl) {
    this.cache.set(key, value, { ttl: ttl * 1000 });
  }
}

// AWS DynamoDB Cache implementation
class DynamoDBCache {
  constructor() {
    const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
    const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
    
    this.client = new DynamoDBClient({ region: process.env.AWS_REGION });
    this.tableName = process.env.CACHE_TABLE || 'StockCache';
    this.marshall = marshall;
    this.unmarshall = unmarshall;
    this.PutItemCommand = PutItemCommand;
    this.GetItemCommand = GetItemCommand;
  }

  async get(key) {
    try {
      const { Item } = await this.client.send(
        new this.GetItemCommand({
          TableName: this.tableName,
          Key: this.marshall({ cacheKey: key })
        })
      );
      return Item ? this.unmarshall(Item).cacheValue : null;
    } catch (error) {
      logger.error(`DynamoDB get error: ${error.message}`);
      return null;
    }
  }

  async set(key, value, ttl = config.cacheTtl) {
    try {
      const expiresAt = Math.floor(Date.now() / 1000) + ttl;
      await this.client.send(
        new this.PutItemCommand({
          TableName: this.tableName,
          Item: this.marshall({
            cacheKey: key,
            cacheValue: value,
            expiresAt
          })
        })
      );
    } catch (error) {
      logger.error(`DynamoDB set error: ${error.message}`);
    }
  }
}

module.exports = process.env.AWS_REGION ? DynamoDBCache : MemoryCache;