# PDF Generator API with PDFKit

A RESTful API for generating dynamic PDF documents with Node.js and PDFKit.

## Features

- **Dynamic PDF Generation**: Create PDFs with custom data
- **Multiple Document Types**: Invoices, reports, certificates, etc.
- **Template System**: Store and reuse PDF templates
- **Custom Styling**: Control fonts, colors, and layouts
- **Authentication**: Secure API endpoints
- **File Management**: Temporary file handling

## API Endpoints

### PDF Generation
- `POST /api/v1/pdf/invoice` - Generate an invoice PDF
- `POST /api/v1/pdf/template` - Generate PDF from stored template

### Template Management
- `POST /api/v1/pdf/templates` - Create a new PDF template
- `GET /api/v1/pdf/templates` - Get all templates

## Request Examples

### Generate Invoice
```json
POST /api/v1/pdf/invoice
{
  "invoiceNumber": "INV-2023-001",
  "date": "2023-01-15",
  "customer": {
    "name": "Acme Corp",
    "address": "123 Business Rd",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "phone": "(555) 123-4567",
    "email": "contact@acme.com"
  },
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 10,
      "price": 75.00
    },
    {
      "description": "Consulting Hours",
      "quantity": 5,
      "price": 120.00
    }
  ],
  "taxRate": 0.08,
  "company": {
    "footerNote": "Net 30 Days Payment Terms"
  }
}
```

### Create Template

```
POST /api/v1/pdf/templates
{
  "name": "standard_report",
  "type": "report",
  "content": "<h1>{{title}}</h1><p>{{content}}</p>",
  "styles": {
    "title": {
      "fontSize": 24,
      "bold": true
    }
  },
  "variables": ["title", "content"]
}
```

```bash
npm install express pdfkit mongoose dotenv cors helmet
npm install --save-dev nodemon
```