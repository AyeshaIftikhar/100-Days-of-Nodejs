const express = require('express');
const app = express();
const loremRoutes = require('./routes/loremRoutes');

const PORT = process.env.PORT || 3000;

app.use('/api/lorem', loremRoutes);

app.get('/', (req, res) => {
  res.send('📝 Welcome to the Lorem Ipsum Generator API!');
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});
