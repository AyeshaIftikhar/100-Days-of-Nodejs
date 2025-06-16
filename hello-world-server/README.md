# Hello World Server (Basic HTTP server)

A simple web server that responds with "Hello, World!"

🚀 What You'll Learn:
✅ Basic Node.js http module
✅ Creating a server and handling requests
✅ Running a Node.js app locally

## 📝 Step-by-Step Code
### 1. Create a new project folder

```bash
mkdir hello-world-server
cd hello-world-server
npm init -y  # Initialize Node.js project
```

### 2. Create `server.js`
```
// Import the 'http' module
const http = require('http');

// Create a server
const server = http.createServer((req, res) => {
  // Set response header
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  // Send response
  res.end('Hello, World!\n');
});

// Define the port (e.g., 3000)
const PORT = 3000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
```

### 3. Run the server
```bash
    node server.js
```

➡️ Open http://localhost:3000 in your browser.
➡️ You should see:
[HelloWorld](hello-world-server/hello-world.png)

## 🔍 Explanation
`http.createServer()`
- Creates an HTTP server that listens for requests.
- The callback (req, res) handles incoming requests (req) and sends responses (res).

`res.writeHead()`
- Sets the HTTP status code (200 = OK) and headers (Content-Type: text/plain).

`res.end()`

- Sends the response ("Hello, World!") and closes the connection.

`server.listen()`

- Starts the server on PORT 3000.