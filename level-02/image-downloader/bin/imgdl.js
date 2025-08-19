#!/usr/bin/env node
import('../src/cli.js').then(m => m.main()).catch(err => {
  console.error(err);
  process.exit(1);
});
