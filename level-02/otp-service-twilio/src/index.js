const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const authRoutes = require('./routes/auth');
const requireAuth = require('./middleware/requiredAuth');
const globalLimiter = require('./middleware/globalLimiter');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(globalLimiter);

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'otp-service-twilio', env: config.env });
});

app.use('/auth', authRoutes);

// Example protected route
app.get('/me', requireAuth, (req, res) => {
  res.json({ user: { phone: req.user.sub, scope: req.user.scope } });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(config.port, () => {
  console.log(`OTP service listening on http://localhost:${config.port}`);
});
