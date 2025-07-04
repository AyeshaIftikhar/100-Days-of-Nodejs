const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'todos.json');

class TodoStorage {
  constructor() {
    this.todos = this._loadData();
  }

  _loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    return [];
  }

  _saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.todos, null, 2));
    } catch (err) {
      console.error('Error saving data:', err);
    }
  }

  getAll(sortBy = 'createdAt', order = 'desc') {
    const sorted = [...this.todos];
    sorted.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      return order === 'asc' 
        ? valA > valB ? 1 : -1 
        : valA < valB ? 1 : -1;
    });
    return sorted;
  }

  getById(id) {
    return this.todos.find(todo => todo.id === id);
  }

  create(todo) {
    const newTodo = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: false,
      ...todo
    };
    this.todos.push(newTodo);
    this._saveData();
    return newTodo;
  }

  update(id, updates) {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) return null;

    const updatedTodo = {
      ...this.todos[todoIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.todos[todoIndex] = updatedTodo;
    this._saveData();
    return updatedTodo;
  }

  delete(id) {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) return false;

    this.todos.splice(todoIndex, 1);
    this._saveData();
    return true;
  }

  deleteCompleted() {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => !todo.completed);
    if (this.todos.length < initialLength) {
      this._saveData();
      return true;
    }
    return false;
  }
}

module.exports = new TodoStorage();