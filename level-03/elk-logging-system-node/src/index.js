const express = require('express');
const morgan = require('morgan');
const logger = require('./logger');
const config = require('./config');
const requestContext = require('./middleware/requestContext');
const requestLogger = require('./middleware/requestLogger');
const { processOrder } = require('./services/exampleService');

const app = express();
app.use(express.json());
app.use(requestContext);

// Minimal request log line (Apache style) for quick dev diagnostics
app.use(morgan('tiny'));

app.use(requestLogger);

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: config.serviceName, env: config.serviceEnv });
});

// Simulate auth: set userId into context if header present
app.use((req, _res, next) => {
  const userId = req.headers['x-user-id'];
  if (userId) req.context.setUserId(userId);
  next();
});

// Example: Create order (generates success/error logs)
app.post('/orders', async (req, res) => {
  try {
    const result = await processOrder({
      userId: req.context.userId || 'anonymous',
      items: req.body.items
    });

    logger.info({
      msg: 'order:created',
      correlationId: req.context.correlationId,
      userId: req.context.userId,
      order: result
    });

    res.status(201).json(result);
  } catch (err) {
    logger.error({
      msg: 'order:error',
      correlationId: req.context.correlationId,
      userId: req.context.userId,
      error: { message: err.message, code: err.code, stack: err.stack }
    });

    res.status(err.status || 500).json({
      error: err.code || 'INTERNAL_ERROR',
      message: err.message
    });
  }
});

// Fallthrough 404
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

// Global unhandled rejections/exceptions
process.on('unhandledRejection', (reason) => {
  logger.fatal({ msg: 'unhandledRejection', reason });
});
process.on('uncaughtException', (err) => {
  logger.fatal({ msg: 'uncaughtException', error: { message: err.message, stack: err.stack } });
  process.exit(1);
});

app.listen(config.port, () => {
  logger.info({ msg: 'service:started', port: config.port });
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${config.port}`);
});
