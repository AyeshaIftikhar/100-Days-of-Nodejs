/**
 * socketHandlers.js
 * - Handles socket.io client connections, room subscriptions
 * - If useRedis true, sets up ioredis pub/sub to broadcast messages across instances
 */

const { createClient } = require('ioredis');

function attach(io, options = {}) {
  const { useRedis = false, redisUrl = 'redis://localhost:6379' } = options;

  if (useRedis) {
    try {
      const pub = createClient({ url: redisUrl });
      const sub = pub.duplicate();

      Promise.all([pub.connect(), sub.connect()])
        .then(() => {
          console.log('Connected to Redis for pub/sub.');
          sub.subscribe('metrics', (err, count) => {
            if (err) console.error('Redis subscribe error', err);
            else console.log(`Subscribed to ${count} channels`);
          });

          sub.on('message', (channel, message) => {
            if (channel === 'metrics') {
              try {
                const payload = JSON.parse(message);
                io.emit('metrics', payload);
              } catch (e) { /* ignore bad messages */ }
            }
          });

          // make Redis clients available for publishing
          io.redisPub = pub;
        })
        .catch(err => {
          console.error('Redis connection error', err);
        });
    } catch (e) {
      console.error('Failed to setup redis adapter', e);
    }
  } else {
    console.log('Running without Redis. Single-instance pub/sub only.');
  }

  io.on('connection', (socket) => {
    console.log('Client connected', socket.id);

    socket.on('subscribe', (payload) => {
      // payload can be like { streams: ['overview', 'errors'] }
      console.log(`Socket ${socket.id} subscribe`, payload);
      // store subscription on socket object
      socket.subscriptions = payload && payload.streams ? payload.streams : ['overview'];
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected', socket.id, reason);
    });

    // allow clients to request historical sample (simple demo)
    socket.on('get_initial', () => {
      socket.emit('initial', {
        ts: Date.now(),
        summary: {
          activeUsers: Math.floor(Math.random() * 100),
          eventsPerSec: (Math.random() * 50).toFixed(2),
          errorRate: (Math.random() * 3).toFixed(2)
        }
      });
    });
  });

  // helper to broadcast metrics from anywhere
  io.broadcastMetrics = async function (metrics) {
    // if redis configured, publish to redis channel for other instances
    if (io.redisPub) {
      try {
        await io.redisPub.publish('metrics', JSON.stringify(metrics));
      } catch (e) {
        console.error('Redis publish failed', e);
      }
    } else {
      io.emit('metrics', metrics);
    }
  };
}

module.exports = { attach };
