// MongoDB initialization script
db = db.getSiblingDB('resource_monitor');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('servers');
db.createCollection('metrics');
db.createCollection('alerts');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.servers.createIndex({ "environment": 1 });
db.servers.createIndex({ "type": 1 });
db.servers.createIndex({ "isActive": 1 });
db.servers.createIndex({ "tags": 1 });

db.metrics.createIndex({ "serverId": 1, "timestamp": -1 });
db.metrics.createIndex({ "timestamp": -1 });
db.metrics.createIndex({ "cpu.usage": 1 });
db.metrics.createIndex({ "memory.percentage": 1 });
db.metrics.createIndex({ "disk.percentage": 1 });

db.alerts.createIndex({ "serverId": 1, "status": 1 });
db.alerts.createIndex({ "type": 1, "severity": 1 });
db.alerts.createIndex({ "status": 1, "createdAt": -1 });

// Create default admin user
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdDOlvzjsGQ4OWu", // password123
  firstName: "System",
  lastName: "Administrator",
  role: "admin",
  isActive: true,
  preferences: {
    theme: "dark",
    notifications: {
      email: true,
      browser: true,
      slack: false
    },
    dashboard: {
      refreshInterval: 5000,
      defaultView: "overview"
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create sample server entries
db.servers.insertMany([
  {
    name: "Production Web Server 1",
    hostname: "web-prod-01",
    ipAddress: "10.0.1.10",
    environment: "production",
    type: "kubernetes",
    os: "Ubuntu 22.04 LTS",
    location: "us-east-1a",
    tags: ["web", "frontend", "production"],
    isActive: true,
    metadata: {
      cluster: "prod-cluster",
      namespace: "web-apps",
      labels: {
        "app": "web-server",
        "environment": "production"
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Database Server",
    hostname: "db-prod-01",
    ipAddress: "10.0.2.10",
    environment: "production",
    type: "kubernetes",
    os: "Ubuntu 22.04 LTS",
    location: "us-east-1b",
    tags: ["database", "mongodb", "production"],
    isActive: true,
    metadata: {
      cluster: "prod-cluster",
      namespace: "databases",
      labels: {
        "app": "mongodb",
        "environment": "production"
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Development Server",
    hostname: "dev-01",
    ipAddress: "10.0.3.10",
    environment: "development",
    type: "virtual",
    os: "Ubuntu 22.04 LTS",
    location: "us-west-2a",
    tags: ["development", "testing"],
    isActive: true,
    metadata: {
      cluster: "dev-cluster",
      namespace: "development"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("Database initialized successfully with indexes and sample data!");
