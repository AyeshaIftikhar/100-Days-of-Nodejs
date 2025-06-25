const express = require("express"); // Import the express module, a web application framework for Node.js
const bmiRoutes = require("./routes/bmi");

const app = express(); // Create an instance of an Express application
const PORT = process.env.PORT || 3000; // Set the port to listen on, defaulting to 3000 if not specified

app.use(express.json()); // Middleware to parse JSON request bodies
app.use("/api/bmi", bmiRoutes); // Use the BMI routes for any requests to /api/bmi

// Health check endpoint
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "✅ BMI Calculator API is running" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`🌐 Access the API at http://localhost:${PORT}/`);
  console.log('❌ Press Ctrl+C to stop the server.');
});
