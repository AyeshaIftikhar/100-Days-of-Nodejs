// Enable sharding for the database
sh.enableSharding("shardingDemo");

// Create collections with different sharding strategies
db = db.getSiblingDB("shardingDemo");

// User collection with hash-based sharding
db.createCollection("users");
sh.shardCollection("shardingDemo.users", { "userId": "hashed" });

// Product collection with range-based sharding
db.createCollection("products");
db.products.createIndex({ "categoryId": 1 });
sh.shardCollection("shardingDemo.products", { "categoryId": 1 });

// Transaction collection with geographic sharding
db.createCollection("transactions");
db.transactions.createIndex({ "regionId": 1 });
sh.shardCollection("shardingDemo.transactions", { "regionId": 1 });

// Create tag ranges for geographic sharding
sh.addShardTag("shard1rs/shard1:27017", "us");
sh.addShardTag("shard2rs/shard2:27017", "eu");
sh.addShardTag("shard3rs/shard3:27017", "asia");

// Add tag ranges
sh.addTagRange(
  "shardingDemo.transactions",
  { "regionId": 1 }, // US region: 1-100
  { "regionId": 101 },
  "us"
);

sh.addTagRange(
  "shardingDemo.transactions",
  { "regionId": 101 }, // EU region: 101-200
  { "regionId": 201 },
  "eu"
);

sh.addTagRange(
  "shardingDemo.transactions",
  { "regionId": 201 }, // Asia region: 201-300
  { "regionId": 301 },
  "asia"
);

// Create some initial data
const regions = [
  { id: 1, name: "US-East" },
  { id: 50, name: "US-West" },
  { id: 101, name: "EU-Central" },
  { id: 150, name: "EU-North" },
  { id: 201, name: "Asia-East" },
  { id: 250, name: "Asia-South" }
];

db.regions.insertMany(regions);

// Create some categories
const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Books" },
  { id: 4, name: "Home & Kitchen" },
  { id: 5, name: "Sports & Outdoors" }
];

db.categories.insertMany(categories);

print("MongoDB sharding initialization completed");
