const path = require('path');
const migration = require(path.join(__dirname, '../migrations/001-initial-admin'));
const db = require('../src/config/database');

(async () => {
  await db.connect();
  await migration.up();
  await db.disconnect();
  process.exit(0);
})();
