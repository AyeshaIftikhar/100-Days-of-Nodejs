#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const express = require('express');
const invoiceGenerator = require('./lib/invoiceGenerator');

const argv = yargs(hideBin(process.argv))
  .option('data', { type: 'string', describe: 'Path to invoice JSON data' })
  .option('out', { type: 'string', describe: 'Output file path' })
  .option('server', { type: 'boolean', describe: 'Run HTTP server to generate invoices' })
  .help()
  .argv;

async function runCLI() {
  const dataPath = argv.data || 'sample_data/sample_invoice.json';
  const outPath = argv.out || `output/invoice-${Date.now()}.pdf`;

  if (!fs.existsSync(dataPath)) {
    console.error(`Data file not found: ${dataPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, 'utf8');
  const invoiceData = JSON.parse(raw);

  // Ensure output directory
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  try {
    await invoiceGenerator.generateFromTemplate(invoiceData, outPath);
    console.log(`Invoice generated: ${outPath}`);
  } catch (err) {
    console.error('Failed to generate invoice:', err);
  }
}

function runServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' })); // allow larger payloads for logos as base64, if needed

  app.get('/', (req, res) => res.send('PDF Invoice Puppeteer - POST /invoice to create invoice PDF.'));

  app.post('/invoice', async (req, res) => {
    const invoiceData = req.body;
    if (!invoiceData) return res.status(400).send({ error: 'Missing invoice JSON in body' });

    const filename = `invoice-${Date.now()}.pdf`;
    const outDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, filename);

    try {
      await invoiceGenerator.generateFromTemplate(invoiceData, outPath);
      res.download(outPath, filename, (err) => {
        if (err) console.error('Error sending file:', err);
        // Optionally cleanup file after sending: fs.unlinkSync(outPath)
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Failed to generate invoice' });
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
}

if (argv.server) {
  runServer();
} else {
  runCLI();
}
