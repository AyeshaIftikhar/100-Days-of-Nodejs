/**
 * Scheduler abstraction built on BullMQ.
 * - addImmediate: add job to queue to run right away
 * - addOneOff: schedule job to run at a timestamp
 * - addRecurring: schedule cron or fixed-interval jobs
 *
 * Job processing is delegated to a Worker which calls handleJob.
 */
const { Queue, Worker, QueueScheduler, JobsOptions } = require('bullmq');
const IORedis = require('ioredis');
const pino = require('pino');
const axios = require('axios');

const cache = require('./cache');

const logger = pino();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl);
const QUEUE_PREFIX = process.env.QUEUE_PREFIX || 'dcq';

const queueName = `${QUEUE_PREFIX}:jobs`;
let queue, worker, queueScheduler;

async function init() {
  queue = new Queue(queueName, { connection, prefix: QUEUE_PREFIX });
  queueScheduler = new QueueScheduler(queueName, { connection, prefix: QUEUE_PREFIX });
  // note: we do not create Worker here in server process. Worker runs in separate process.
  // But keep the queue and scheduler available for the API.
  await queue.waitUntilReady();
  await queueScheduler.waitUntilReady();
}

/**
 * Run in server process to create/add jobs
 */
async function addImmediate(jobId, name, payload) {
  await queue.add(name, payload, { jobId });
}

async function addOneOff(jobId, name, payload, { runAt }) {
  const timestamp = Number(runAt);
  if (!timestamp) throw new Error('invalid runAt');
  await queue.add(name, payload, { jobId, delay: Math.max(0, timestamp - Date.now()) });
}

async function addRecurring(jobId, name, payload, opts = {}) {
  const jobOpts = {};
  if (opts.cron) {
    jobOpts.repeat = { cron: opts.cron, jobId: jobId };
  } else if (opts.everyInMs) {
    jobOpts.repeat = { every: Number(opts.everyInMs), jobId: jobId };
  } else {
    throw new Error('cron or everyInMs required for recurring');
  }
  await queue.add(name, payload, jobOpts);
}

/**
 * The worker initialization (to be run in worker process)
 */
async function initWorker() {
  queue = new Queue(queueName, { connection, prefix: QUEUE_PREFIX });
  queueScheduler = new QueueScheduler(queueName, { connection, prefix: QUEUE_PREFIX });

  // Worker with concurrency 5. Add processors for job names.
  worker = new Worker(
    queueName,
    async job => {
      return handleJob(job.name, job.data, job.id);
    },
    { connection, prefix: QUEUE_PREFIX, concurrency: 5 }
  );

  worker.on('completed', job => logger.info({ jobId: job.id, name: job.name }, 'job completed'));
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, name: job?.name, err: err?.message }, 'job failed'));
  await worker.waitUntilReady();
  await queueScheduler.waitUntilReady();
}

/**
 * Example job handler — extend this map for real tasks
 */
async function handleJob(name, data) {
  logger.info({ name, data }, 'handling job');

  switch (name) {
    case 'refresh-cache': {
      // simulate fetching fresh data from remote
      const key = data.key || 'default';
      const remoteUrl = data.url;
      let value;
      if (remoteUrl) {
        try {
          const r = await axios.get(remoteUrl, { timeout: 5000 });
          value = r.data;
        } catch (err) {
          logger.error({ err: err.message }, 'fetch remote failed, using fallback');
          value = { fallback: true, ts: Date.now() };
        }
      } else {
        value = { generated: true, ts: Date.now(), rnd: Math.random() };
      }
      await cache.set(key, JSON.stringify(value), data.ttl || 60);
      return { key, value };
    }

    case 'log-message': {
      logger.info({ payload: data }, 'log-message job');
      return true;
    }

    default:
      logger.warn({ name }, 'no handler for job');
      return null;
  }
}

module.exports = {
  init,
  addImmediate,
  addOneOff,
  addRecurring,
  initWorker
};
