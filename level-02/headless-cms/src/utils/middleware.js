
const { ForbiddenError } = require('./errors');
const winstonLogger = require('./logger');


function errorHandler() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = {
        error: err.message,
        status: ctx.status
      };
      if (ctx.status >= 500) {
        winstonLogger.error(err.stack);
      }
    }
  };
}

function requestLogger() {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    winstonLogger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
  };
}

function hasRole(role) {
  return async (ctx, next) => {
    if (ctx.state.user?.roles?.includes(role)) {
      await next();
    } else {
      throw new ForbiddenError();
    }
  };
}

module.exports = {
  errorHandler,
  requestLogger,
  hasRole
};