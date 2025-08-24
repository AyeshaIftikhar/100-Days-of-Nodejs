// Simple JSON file persistence (no external DB)
// Safe for single-user / local usage. For multi-user, switch to a DB.

import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';

const defaultData = {
  notes: [],
  todos: [],
  reminders: []
};

export class JsonDB {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this._ensureFile();
  }

  _ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async read() {
    const raw = await fsp.readFile(this.filePath, 'utf-8');
    try {
      const data = JSON.parse(raw);
      // ensure all keys
      for (const k of Object.keys(defaultData)) {
        if (!Object.prototype.hasOwnProperty.call(data, k)) data[k] = [];
      }
      return data;
    } catch (e) {
      // reset on corruption
      await this.write(defaultData);
      return { ...defaultData };
    }
  }

  async write(data) {
    await fsp.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  // Notes
  async addNote(text) {
    const data = await this.read();
    const note = { id: Date.now(), text, createdAt: new Date().toISOString() };
    data.notes.unshift(note);
    await this.write(data);
    return note;
  }
  async listNotes() {
    const data = await this.read();
    return data.notes;
  }
  async clearNotes() {
    const data = await this.read();
    data.notes = [];
    await this.write(data);
  }

  // Todos
  async addTodo(text) {
    const data = await this.read();
    const todo = { id: Date.now(), text, done: false, createdAt: new Date().toISOString() };
    data.todos.push(todo);
    await this.write(data);
    return todo;
  }
  async listTodos() {
    const data = await this.read();
    return data.todos;
  }
  async toggleTodo(id, done) {
    const data = await this.read();
    data.todos = data.todos.map(t => t.id === id ? { ...t, done: done ?? !t.done } : t);
    await this.write(data);
  }
  async deleteTodo(id) {
    const data = await this.read();
    data.todos = data.todos.filter(t => t.id !== id);
    await this.write(data);
  }

  // Reminders
  async addReminder(message, whenISO) {
    const data = await this.read();
    const reminder = { id: Date.now(), message, when: whenISO, fired: false, createdAt: new Date().toISOString() };
    data.reminders.push(reminder);
    await this.write(data);
    return reminder;
  }
  async listReminders(includeFired = false) {
    const data = await this.read();
    return includeFired ? data.reminders : data.reminders.filter(r => !r.fired);
  }
  async markReminderFired(id) {
    const data = await this.read();
    data.reminders = data.reminders.map(r => r.id === id ? { ...r, fired: true } : r);
    await this.write(data);
  }
}
