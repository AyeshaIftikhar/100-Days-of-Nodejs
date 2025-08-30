/**
 * Real-time Analytics Dashboard - server
 * - Express serves static dashboard at / (public/)
 * - Socket.IO broadcasts metrics
 * - Optional Redis adapter: if USE_REDIS=true, use Redis pub/sub (via ioredis)
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const USE_REDIS = (process.env.USE_REDIS || 'false').toLowerCase() === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// simple health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const socketHandlers = require('./socketHandlers');
socketHandlers.attach(io, { useRedis: USE_REDIS, redisUrl: REDIS_URL });

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}. USE_REDIS=${USE_REDIS}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});

// start data generator in-process only when not in production container orchestrator
if (require.main === module) {
  // spawn data generator to publish to socket server
  const generator = require('./dataGenerator');
  generator.start(io);
}
