const express = require('express');
const app = express();
const PORT = process.env.SAMPLE_PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'sample-upstream', msg: 'hello from upstream' });
});

app.get('/echo', (req, res) => {
  res.json({ query: req.query, headers: req.headers });
});

app.listen(PORT, () => {
  console.log(`Sample upstream listening on http://localhost:${PORT}`);
});
