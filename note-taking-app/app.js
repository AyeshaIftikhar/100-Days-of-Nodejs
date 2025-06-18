const fs = require('fs');
const path = require('path');

// File path for storing notes
const notesPath = path.join(__dirname, 'notes.json');

// Initialize notes file if it doesn't exist
if (!fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, '[]', 'utf8');
}

// CRUD Operations

/**
 * Create a new note
 * @param {string} title - Note title
 * @param {string} content - Note content
 */
function createNote(title, content) {
    const notes = getAllNotes();
    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    notes.push(newNote);
    saveNotes(notes);
    return newNote;
}

/**
 * Get all notes
 * @returns {Array} Array of notes
 */
function getAllNotes() {
    const data = fs.readFileSync(notesPath, 'utf8');
    return JSON.parse(data);
}

/**
 * Get a single note by ID
 * @param {string} id - Note ID
 * @returns {Object|null} The note object or null if not found
 */
function getNote(id) {
    const notes = getAllNotes();
    return notes.find(note => note.id === id) || null;
}

/**
 * Update a note
 * @param {string} id - Note ID
 * @param {Object} updates - Object with title and/or content to update
 * @returns {Object|null} Updated note or null if not found
 */
function updateNote(id, { title, content }) {
    const notes = getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) return null;
    
    if (title) notes[noteIndex].title = title;
    if (content) notes[noteIndex].content = content;
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    saveNotes(notes);
    return notes[noteIndex];
}

/**
 * Delete a note
 * @param {string} id - Note ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteNote(id) {
    const notes = getAllNotes();
    const initialLength = notes.length;
    const filteredNotes = notes.filter(note => note.id !== id);
    
    if (filteredNotes.length === initialLength) return false;
    
    saveNotes(filteredNotes);
    return true;
}

// Helper function to save notes to file
function saveNotes(notes) {
    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2), 'utf8');
}

// Export the functions
module.exports = {
    createNote,
    getAllNotes,
    getNote,
    updateNote,
    deleteNote
};