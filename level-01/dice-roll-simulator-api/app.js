const express = require('express');
const app = express();
const diceRoutes = require('./routes/diceRoutes');

const PORT = process.env.PORT || 3000;

app.use('/api/dice', diceRoutes);

app.get('/', (req, res) => {
  res.send('🎲 Welcome to Dice Roll Simulator API!');
});

app.listen(PORT, () => {
  console.log(`🚀 Dice API running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});
