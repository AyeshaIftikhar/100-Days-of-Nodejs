/**
 * dataGenerator.js
 * - Generates fake metric data and pushes through io.broadcastMetrics
 * - If an io instance isn't passed, it will attempt to create a simple local emitter
 */

const DEFAULT_INTERVAL = parseInt(process.env.DATA_GENERATOR_INTERVAL_MS || '1000', 10);

function generateSample() {
  const activeUsers = Math.max(1, Math.floor(50 + Math.random() * 250 * Math.sin(Date.now() / 60000) + Math.random() * 50));
  const eventsPerSec = Math.max(0, (5 + Math.random() * 100).toFixed(2));
  const errorRate = Math.max(0, (Math.random() * 5).toFixed(2));
  const avgLatencyMs = Math.max(10, (20 + Math.random() * 300).toFixed(0));

  return {
    ts: Date.now(),
    metrics: {
      activeUsers,
      eventsPerSec: Number(eventsPerSec),
      errorRate: Number(errorRate),
      avgLatencyMs: Number(avgLatencyMs)
    }
  };
}

let intervalId = null;

function start(io) {
  if (!io) {
    console.warn('No io instance passed to dataGenerator.start(). Nothing will be emitted.');
    return;
  }

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    const sample = generateSample();
    // broadcast via socketHandlers helper (handles Redis or direct emit)
    if (typeof io.broadcastMetrics === 'function') {
      io.broadcastMetrics(sample);
    } else {
      io.emit('metrics', sample);
    }
  }, DEFAULT_INTERVAL);

  console.log(`Data generator started with interval ${DEFAULT_INTERVAL}ms`);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = { start, stop, generateSample };
