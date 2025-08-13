// generate-jwt-key.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const secret = crypto.randomBytes(32).toString('hex');
const envPath = path.join(__dirname, '.env');

// Check if .env exists
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => !line.startsWith('JWT_SECRET='))
    .join('\n');
}

envContent += `\nJWT_SECRET=${secret}\n`;
fs.writeFileSync(envPath, envContent.trim() + '\n');

console.log(`✅ New JWT secret generated and saved to .env:\n${secret}`);
