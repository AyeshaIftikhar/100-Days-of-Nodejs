const express = require('express');
const app = express();
const scrapeRoutes = require('./routes/scrapeRoutes');

const PORT = process.env.PORT || 3000;

app.use('/api', scrapeRoutes);

app.get('/', (req, res) => {
  res.send('🕷️ Simple Web Scraper API using Cheerio');
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper running at http://localhost:${PORT}`);
});
