const { createNote, getAllNotes, getNote, updateNote, deleteNote } = require('./app');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function displayMenu() {
    console.log('\nNote-Taking App');
    console.log('1. Create a new note');
    console.log('2. View all notes');
    console.log('3. View a specific note');
    console.log('4. Update a note');
    console.log('5. Delete a note');
    console.log('6. Exit');
}

function main() {
    displayMenu();
    
    rl.question('Choose an option (1-6): ', async (choice) => {
        switch (choice) {
            case '1':
                rl.question('Enter note title: ', (title) => {
                    rl.question('Enter note content: ', (content) => {
                        const note = createNote(title, content);
                        console.log('Note created:', note);
                        main();
                    });
                });
                break;
                
            case '2':
                const notes = getAllNotes();
                console.log('\nAll Notes:');
                notes.forEach(note => {
                    console.log(`\nID: ${note.id}`);
                    console.log(`Title: ${note.title}`);
                    console.log(`Content: ${note.content}`);
                    console.log(`Created: ${note.createdAt}`);
                    console.log(`Updated: ${note.updatedAt}`);
                });
                if (notes.length === 0) console.log('No notes found.');
                main();
                break;
                
            case '3':
                rl.question('Enter note ID: ', (id) => {
                    const note = getNote(id);
                    if (note) {
                        console.log('\nNote Found:');
                        console.log(`ID: ${note.id}`);
                        console.log(`Title: ${note.title}`);
                        console.log(`Content: ${note.content}`);
                        console.log(`Created: ${note.createdAt}`);
                        console.log(`Updated: ${note.updatedAt}`);
                    } else {
                        console.log('Note not found.');
                    }
                    main();
                });
                break;
                
            case '4':
                rl.question('Enter note ID to update: ', (id) => {
                    const note = getNote(id);
                    if (!note) {
                        console.log('Note not found.');
                        return main();
                    }
                    rl.question(`New title (current: ${note.title}): `, (title) => {
                        rl.question(`New content (current: ${note.content}): `, (content) => {
                            const updates = {};
                            if (title) updates.title = title;
                            if (content) updates.content = content;
                            const updatedNote = updateNote(id, updates);
                            console.log('Note updated:', updatedNote);
                            main();
                        });
                    });
                });
                break;
                
            case '5':
                rl.question('Enter note ID to delete: ', (id) => {
                    const success = deleteNote(id);
                    console.log(success ? 'Note deleted successfully.' : 'Note not found.');
                    main();
                });
                break;
                
            case '6':
                console.log('Goodbye!');
                rl.close();
                break;
                
            default:
                console.log('Invalid choice. Please try again.');
                main();
        }
    });
}

// Start the application
main();