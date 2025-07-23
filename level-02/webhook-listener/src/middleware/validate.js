const bodyParser = require('body-parser');

// Middleware to store raw body for signature verification
const rawBodyMiddleware = bodyParser.json({
  verify: (req, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString('utf8');
    }
  },
});

module.exports = { rawBodyMiddleware };