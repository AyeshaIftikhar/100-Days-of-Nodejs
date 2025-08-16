const express = require('express');
const serverRouter = require('./src/handlers/server.handler');
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', serverRouter);

app.listen(PORT, () => {
  console.log(`QR Code Generator server running on port ${PORT}`);
});
