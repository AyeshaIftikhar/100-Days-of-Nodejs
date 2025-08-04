# QR Code Generator API

A high-performance QR code generation API with multiple deployment options.

## Features

### Core Functionality

- **Text to QR Code**: Convert any text to QR code image
- **Customizable Output**: PNG, JPEG, and WebP formats
- **Advanced Options**:
  - Custom colors
  - Error correction levels
  - Logo embedding
  - Size adjustment
- **Multiple Deployment Options**:
  - AWS Lambda
  - Vercel Serverless
  - Docker container
  - Standalone Express server

### Technical Highlights

- **Caching Layer**: Built-in response caching
- **Validation**: Input sanitization and validation
- **Error Handling**: Comprehensive error management
- **Scalable**: Designed for high throughput

## API Endpoints

### GET `/generate`

**Parameters**:

- `text`: Required - Text to encode
- `format`: Optional - Output format (png, jpeg, webp)
- `width`: Optional - Image width in pixels
- `color`: Optional - Foreground color (hex)
- `bgcolor`: Optional - Background color (hex)

### POST `/generate`

**Body**:

```json
{
  "text": "Hello World",
  "format": "png",
  "width": 300,
  "color": "#ff0000",
  "bgcolor": "#ffffff"
}
```

## Deployment Options

1. Vercel (Serverless)
```bash
   npm install -g vercel
   vercel
```
2. AWS Lambda (Serverless Framework)
```bash
   npm install -g serverless
   serverless deploy
```
3. Docker

```bash
   docker build -t qr-generator .
   docker run -p 3000:3000 qr-generator
```

4. Standalone Express Server

```bash
   npm install
   npm start
   Usage Examples
```

## Basic QR Code

```bash
curl "https://your-api.com/generate?text=https://example.com"
```

## Custom QR Code
```bash
curl "https://your-api.com/generate?text=Hello&width=300&color=ff0000&bgcolor=eeeeee"
```
## With Logo (POST)
```bash
curl -X POST https://your-api.com/generate \
 -H "Content-Type: application/json" \
 -d '{"text": "Hello", "logo": "https://example.com/logo.png"}'
```

### Response Headers

```curl
Content-Type: image/png (or other format)

Cache-Control: public, max-age=86400

Content-Length: Image size in bytes
```

## Rate Limiting

The API includes built-in rate limiting when deployed with API Gateway or Vercel.

## Future Enhancements

- Authentication: API key support
- Batch Generation: Multiple QR codes in one request
- Analytics: Usage tracking
- Dynamic Sizing: Auto-adjust based on content
- More Formats: SVG output support

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

```
qr-code-generator/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── vercel.json
├── serverless.yml
├── src/
│   ├── handlers/
│   │   ├── aws.handler.js
│   │   ├── vercel.handler.js
│   │   └── server.handler.js
│   ├── lib/
│   │   ├── qrGenerator.js
│   │   ├── cache.js
│   │   ├── validator.js
│   │   └── response.js
│   └── utils/
│       ├── config.js
│       └── logger.js
├── tests/
│   ├── integration/
│   └── unit/
└── Dockerfile
```
