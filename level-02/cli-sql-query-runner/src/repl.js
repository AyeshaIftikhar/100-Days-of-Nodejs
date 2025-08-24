import readline from 'node:readline';
import { splitStatements } from './runner.js';
import { emit } from './format.js';

export async function startRepl(conn, format='table') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 1000,
    prompt: 'sqlr> '
  });
  let buffer = '';
  rl.prompt();
  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed === '\\q' || trimmed === '\\quit' || trimmed === '\\exit') {
      break;
    }
    buffer += line + '\n';
    // if the buffer ends with a semicolon outside quotes, execute
    const statements = splitStatements(buffer);
    // if last char of buffer is ';', we have at least one complete statement
    if (buffer.trim().endsWith(';')) {
      try {
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          const results = await conn.query(stmt);
          for (const r of results) {
            if (r.type === 'rows') {
              console.log(emit(r.rows, format));
            } else {
              console.log(JSON.stringify(r));
            }
          }
        }
      } catch (e) {
        console.error('Error:', e.message);
      }
      buffer = '';
    }
    rl.prompt();
  }
  rl.close();
}