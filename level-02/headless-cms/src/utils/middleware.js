const { ForbiddenError } = require('./errors');
const logger = require('./logger');

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
        logger.error(err.stack);
      }
    }
  };
}

function logger() {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    
    logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
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
  logger,
  hasRole
};