const { v4: uuidv4 } = require('uuid');

/**
 * Adds a correlationId to each request and exposes a helper to attach
 * userId (if available) so logs across services can be stitched together.
 */
module.exports = function requestContext(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.context = {
    correlationId,
    userId: null,
    setUserId: (id) => { req.context.userId = id; }
  };
  res.setHeader('x-correlation-id', correlationId);
  next();
};
