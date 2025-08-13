#!/usr/bin/env node
import('../src/cli.js').catch((err) => {
  console.error(err);
  process.exit(1);
});

// Make it executable on Unix-like systems (usually automatic via npm link), otherwise: chmod +x bin/clivault.js.