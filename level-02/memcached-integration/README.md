# Memcached Integration

Memcached is an open-source, high-performance, in-memory caching system that’s mainly used to make applications faster by temporarily storing (caching) frequently accessed data in RAM instead of fetching it repeatedly from a database or API.

Think of it like a super-fast clipboard for your app — you keep copies of expensive-to-fetch data in memory so you can grab it quickly next time.

## How It Works

- Your app asks for some data.
- Check Memcached first:
  - If the data is there (cache hit), you get it instantly from memory.
  - If it’s not (cache miss), fetch it from the database/API, then store it in Memcached for next time.
  - Data is stored in key-value pairs.
  - Every cached item has an expiration time (TTL) after which it’s automatically removed.

## Key Features

- In-memory: Keeps data in RAM, so it’s lightning fast.
- Key-value store: Simple storage model — key is a string, value can be text, JSON, or serialized objects.
- Distributed: You can have multiple Memcached servers working together.
- Language agnostic: Works with many languages (Node.js, PHP, Python, Java, etc.).
- Volatile: It’s not a database — data disappears if the server restarts or memory is full.

## Common Use Cases

- Caching database queries to reduce load.
- Storing rendered HTML to serve pages faster.
- Session storage for web apps.
- API response caching to avoid repeated calls.

## Benefits

- 🚀 Speed: RAM is way faster than disk or database queries.
- ⚡ Scalability: Handles lots of requests per second.
- 💸 Cost-effective: Reduces expensive database load.

## Drawbacks

- No persistence: Data is gone after restart or eviction.
- Limited by RAM size.
- Simple storage: No complex querying like a database.

## How to Run it

```bash
# Health
curl http://localhost:3000/health

# Set cache
curl -X POST http://localhost:3000/cache \
  -H "Content-Type: application/json" \
  -d '{"key":"greeting","value":{"msg":"hello"},"ttl":30}'

# Get cache
curl http://localhost:3000/cache/greeting

# Delete
curl -X DELETE http://localhost:3000/cache/greeting

# Cached Fibonacci
curl http://localhost:3000/fib/35
```

- using docker

```bash
docker compose up --build
# API: http://localhost:3000
# Memcached: localhost:11211
```
