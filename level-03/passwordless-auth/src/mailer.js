import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let transporter;
if (config.mail.host && config.mail.auth) {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: config.mail.auth
  });
} else {
  // Fallback: write emails to file and console for local/dev
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
}

export async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: config.mail.from,
    to,
    subject,
    html,
    text
  });

  // If using stream transport, save preview
  if (!config.mail.host || !config.mail.auth) {
    const filePath = path.join(outDir, `mail-${Date.now()}.eml`);
    fs.writeFileSync(filePath, info.message);
    // Also log a quick preview line
    console.log("\n[mail] To: ${to} | Subject: ${subject}");
    console.log(`[mail] Preview saved: ${filePath}\n`);
  }

  return info;
}
