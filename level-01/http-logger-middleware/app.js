const express = require('express');
const httpLogger = require('./middleware/httpLogger');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Use custom HTTP Logger
app.use(httpLogger);

// Use routes
app.use('/', testRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
