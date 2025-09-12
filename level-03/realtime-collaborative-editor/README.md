# Real-Time Collaborative Editor

A collaborative text editing application that allows multiple users to simultaneously edit documents in real-time. Built with Node.js, Express, Socket.IO, and Operational Transformation algorithm.

## Features

- Real-time collaborative document editing
- Multiple users can edit the same document simultaneously
- Changes are synchronized across all connected clients instantly
- Operational Transformation for conflict resolution
- User presence indication (see who's currently editing)
- Document history and version control
- Simple and intuitive user interface

## Tech Stack

- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **Conflict Resolution**: Operational Transformation (OT)
- **Frontend**: HTML, CSS, JavaScript

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd realtime-collaborative-editor
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
PORT=3000
```

4. Start the server
```bash
npm start
```

5. For development with auto-restart:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## How It Works

### Operational Transformation (OT)

This project uses Operational Transformation to manage concurrent edits without conflicts. OT is a technology for supporting real-time collaborative editing of documents by multiple distributed users:

1. When a user makes a change, it's converted to an operation
2. The operation is applied locally immediately
3. The operation is sent to the server
4. The server transforms the operation against concurrent operations
5. The server broadcasts the transformed operation to all clients
6. Clients apply the transformed operation to their local document

This ensures that all users end up with the same document content regardless of network latency.

## Project Structure

```
realtime-collaborative-editor/
├── src/
│   ├── server.js               # Main server entry point
│   ├── document.js             # Document management
│   ├── socket-handler.js       # Socket.IO event handlers
│   └── utils/                  # Utility functions
│       └── ot-adapter.js       # OT library adapter
├── public/
│   ├── index.html              # Main page
│   ├── js/
│   │   ├── editor.js           # Editor functionality
│   │   ├── socket-client.js    # Socket.IO client
│   │   └── ui.js               # UI controls
│   ├── css/
│   │   └── styles.css          # Styling
│   └── favicon.ico
├── package.json
├── .env                        # Environment variables
└── README.md
```

## API Endpoints

- `GET /`: Home page with editor interface
- `GET /documents`: Get list of available documents
- `GET /documents/:id`: Get a specific document by ID
- `POST /documents`: Create a new document

## Socket Events

- `connection`: Client connects to the server
- `join-document`: Client joins a document editing session
- `leave-document`: Client leaves a document
- `text-operation`: Client sends a text operation
- `selection-change`: Client updates their cursor position
- `user-joined`: New user joined the document
- `user-left`: User left the document
- `document-state`: Initial document state

## Future Enhancements

1. **User Authentication**: Add user accounts, login, and permission control
2. **Rich Text Editing**: Support for formatting, images, and other rich content
3. **Document Templates**: Predefined document templates for common use cases
4. **Export Options**: Export documents to PDF, Markdown, or other formats
5. **Commenting System**: Allow users to add comments to documents
6. **Mobile Support**: Responsive design for mobile editing
7. **Offline Support**: Continue editing when offline and sync when reconnected
8. **Document Sharing**: Improved sharing options with access controls
9. **Real-time Chat**: Integrated chat for document collaborators
10. **Custom Styling**: Document and editor theming options

## License

This project is licensed under the MIT License - see the LICENSE file for details.
