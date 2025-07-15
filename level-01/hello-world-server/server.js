// import the http module
const http = require("http");

// Create a server
const server = http.createServer((req, res) => {
  // can also user html
  // res.writeHead(200, { "Content-Type": "text/html" });
  // res.end("<h1>Hello, World! ✅</h1>");

  // Set response header
  res.writeHead(200, { "Content-Type": "text/plain" });
  // Add a custom route
  if (req.url === "/") {
    res.end("Welcome to the Home Page!\n");
    return; // Stop further processing
  }
  // Add another custom route
  if (req.url === "/about") {
    res.end("About Page\n");
    return; // Stop further processing
  }

  // Send response
  res.end("Hello, World!\n");
});

// Define the port (e.g., 3000)
const PORT = 3000;

server.on("error", (err) => {
  console.error("Server error:", err);
});

// Start the server
server.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}/\nPress Ctrl+C to stop the server.`
  );
});
