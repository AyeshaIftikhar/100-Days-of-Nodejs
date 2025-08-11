# PDF Invoice Generator (Node.js)

A simple, lightweight Node.js project that generates PDF invoices using **pdfkit**. It includes a CLI mode and a minimal HTTP server mode.

## Features
- HTML/CSS invoice template for precise, printable layout.
- Handlebars templating (dynamic items, totals, notes).
- Puppeteer produces high-quality PDF (printBackground: true).
- CLI and HTTP API (`POST /invoice`) available.
- Supports inline base64 logo or local logo file.

## Requirements
- Node.js 16+ (tested on Node 18)
- npm

```
npm run generate
# or
node index.js --data sample_data/sample_invoice.json --out output/my-invoice.pdf
```

- Start server (HTTP)
```
npm run server
# server listens on http://localhost:3000
POST JSON invoice to http://localhost:3000/invoice with Content-Type: application/json. The response will be a downloadable PDF.
```

## xample using curl:

```
curl -X POST http://localhost:3000/invoice \
  -H "Content-Type: application/json" \
  -d @sample_data/sample_invoice.json --output invoice.pdf
```
## Invoice JSON format
- See sample_data/sample_invoice.json for a complete example. Basic fields:
- company (name, address)
- customer (name, email, address)
- invoice_number, date, due_date
- currency_symbol (string)
- items: array of objects { name, description, quantity, unit_price, tax_rate }
- notes, signature_text (optional)

## Extensibility & Future Enhancements
- Add templating with Handlebars to support multiple invoice templates.
- Add currency formatting and localization (intl).
- Add QR-code for payment links / UPI / bank details.
- Add database storage for invoices and retrieval endpoints.
- Add authentication + rate limiting for the HTTP API.
- Add email delivery (send PDF as attachment).
- Add unit tests and CI/CD pipeline.
- Dockerize the app and publish a small image for easy deployment.
- Add invoice numbering logic and PDF metadata (author, title).
- Add multi-page table handling with improved layout.

## Notes
- templates/logo.png is optional. Replace with your company logo if desired.
- This project writes generated files into the output/ folder by default.
