import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as chrono from 'chrono-node';
import { JsonDB } from './db.js';
import { startReminderScheduler } from './reminderScheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || './data.json';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" }
});

const db = new JsonDB(DATA_FILE);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API ---
// Health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Notes
app.get('/api/notes', async (req, res) => res.json(await db.listNotes()));
app.post('/api/notes', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });
  const note = await db.addNote(text.trim());
  res.status(201).json(note);
});
app.delete('/api/notes', async (req, res) => {
  await db.clearNotes();
  res.json({ ok: true });
});

// Todos
app.get('/api/todos', async (req, res) => res.json(await db.listTodos()));
app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });
  const todo = await db.addTodo(text.trim());
  res.status(201).json(todo);
});
app.patch('/api/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { done } = req.body;
  await db.toggleTodo(id, done);
  res.json({ ok: true });
});
app.delete('/api/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  await db.deleteTodo(id);
  res.json({ ok: true });
});

// Reminders
app.get('/api/reminders', async (req, res) => res.json(await db.listReminders(true)));
app.post('/api/reminders', async (req, res) => {
  const { message, when } = req.body; // when can be ISO or natural language
  if (!message || !message.trim()) return res.status(400).json({ error: 'message required' });
  let whenISO = null;

  if (when && /\d/.test(when)) {
    const parsed = chrono.parseDate(when, { forwardDate: true });
    if (parsed) whenISO = parsed.toISOString();
  }
  if (!whenISO) return res.status(400).json({ error: 'invalid or missing time' });

  const reminder = await db.addReminder(message.trim(), whenISO);
  res.status(201).json(reminder);
});

// Socket.io
io.on('connection', (socket) => {
  console.log('🔌 client connected', socket.id);
  socket.on('disconnect', () => console.log('❌ client disconnected', socket.id));
});

// Start scheduler
const stopScheduler = startReminderScheduler({ db, io, intervalMs: 10_000 });

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 VoxAssist server on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  stopScheduler?.();
  process.exit(0);
});
