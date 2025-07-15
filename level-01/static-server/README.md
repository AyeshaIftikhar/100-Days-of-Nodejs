# Static File Server

a static file server using Node.js with Express. This server will serve files from a specified directory with proper MIME types, directory listing, and caching headers.

## Features

- Serve static files (HTML, CSS, JS, images, etc.)
- Directory listing (optional)
- Proper MIME type detection
- Caching headers
- Range requests support (for audio/video)
- Gzip compression
- Custom 404 pages
- Security headers

- self signed certification for http support

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

- Docker Support

```bash
// Dockerfile
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build & Run

```bash
docker build -t static-server .
docker run -p 3000:3000 -v $(pwd)/public:/usr/src/app/public static-server
```
