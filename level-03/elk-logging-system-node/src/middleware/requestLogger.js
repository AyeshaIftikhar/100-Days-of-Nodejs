const logger = require('../logger');

/**
 * Logs key request lifecycle events with structured fields.
 * Captures route, method, status, duration, correlationId, userId, and errors.
 */
module.exports = function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  // Log request start
  logger.info({
    msg: 'request:start',
    method: req.method,
    url: req.originalUrl,
    correlationId: req.context.correlationId,
    userId: req.context.userId
  });

  // On finish
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;

    logger.info({
      msg: 'request:finish',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      correlationId: req.context.correlationId,
      userId: req.context.userId
    });
  });

  // On error
  res.on('close', () => {
    if (!res.writableEnded) {
      logger.warn({
        msg: 'request:aborted',
        method: req.method,
        url: req.originalUrl,
        correlationId: req.context.correlationId,
        userId: req.context.userId
      });
    }
  });

  next();
};
