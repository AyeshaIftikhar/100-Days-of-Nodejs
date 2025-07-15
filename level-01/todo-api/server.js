const express = require("express");
const bodyParser = require("body-parser");
const storage = require("./storage");

const app = express();
app.use(bodyParser.json());

// Validation middleware
function validateTodo(req, res, next) {
  const { title } = req.body;
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  next();
}

// API Routes
app.get("/", (req, res) => {
  res.send(`
    <h1>Todo API</h1>
    <p>Welcome to the Todo API! Use the endpoints below:</p>
    <ul>
      <li><strong>GET</strong> /api/todos - Get all todos</li>
      <li><strong>GET</strong> /api/todos/:id - Get todo by ID</li>
      <li><strong>POST</strong> /api/todos - Create a new todo</li>
      <li><strong>PUT</strong> /api/todos/:id - Update a todo</li>
      <li><strong>PATCH</strong> /api/todos/:id/toggle - Toggle todo completion</li>
      <li><strong>DELETE</strong> /api/todos/:id - Delete a todo</li>
      <li><strong>DELETE</strong> /api/todos - Delete all completed todos</li>
    </ul>
    <p>Use query parameters to sort and filter todos:</p>
    <ul>
      <li><strong>sort</strong>: createdAt, updatedAt, title</li>
      <li><strong>order</strong>: asc, desc (default: desc)</li>
      <li><strong>completed</strong>: true, false (filter by completion status)</li>
    </ul>
  `);
});

app.get("/api/todos", (req, res) => {
  const { sort = "createdAt", order = "desc", completed } = req.query;
  let todos = storage.getAll(sort, order);

  if (completed === "true") todos = todos.filter((t) => t.completed);
  if (completed === "false") todos = todos.filter((t) => !t.completed);

  res.json(todos);
});

app.get("/api/todos/:id", (req, res) => {
  const todo = storage.getById(req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
});

app.post("/api/todos", validateTodo, (req, res) => {
  const todo = storage.create(req.body);
  res.status(201).json(todo);
});

app.put("/api/todos/:id", validateTodo, (req, res) => {
  const updatedTodo = storage.update(req.params.id, req.body);
  if (!updatedTodo) return res.status(404).json({ error: "Todo not found" });
  res.json(updatedTodo);
});

app.patch("/api/todos/:id/toggle", (req, res) => {
  const todo = storage.getById(req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });

  const updatedTodo = storage.update(req.params.id, {
    completed: !todo.completed,
  });
  res.json(updatedTodo);
});

app.delete("/api/todos/:id", (req, res) => {
  const success = storage.delete(req.params.id);
  if (!success) return res.status(404).json({ error: "Todo not found" });
  res.status(204).end();
});

app.delete("/api/todos", (req, res) => {
  const success = storage.deleteCompleted();
  res.json({ success });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/todos`);
  console.log("❌ Press Ctrl+C to stop the server");
});
