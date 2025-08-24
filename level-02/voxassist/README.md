# VoxAssist — Text-to-Speech + Simple Voice Assistant

VoxAssist is a local-first, privacy-friendly voice assistant you can run on your machine. It helps you **take notes**, **manage todos**, and **schedule reminders**—hands-free. It uses the browser’s built-in Web Speech APIs for speech recognition and TTS, and a lightweight Node.js server for persistence and reminder scheduling.

## Why this solves a real problem

- **Accessibility**: Hands-free note-taking and reminders are useful for users with mobility/vision challenges.
- **Productivity**: Speak todos and reminders without context-switching while you work.
- **Privacy-first**: No paid cloud APIs; data persists to a local JSON file.

---

## Features

- 🎤 Voice commands (Chrome recommended):
  - `add note buy milk`
  - `list notes`, `read last note`, `clear notes`
  - `add todo finish report`, `list todos`, `delete todo 2`
  - `set reminder in 10 minutes to stretch`
  - `what time is it`, `help`
- 🔊 TTS responses using Web Speech Synthesis.
- 💾 Local JSON storage (no external DB).
- ⏰ Server-side reminder scheduler pushes due reminders to the browser with Socket.IO and speaks them aloud.
- 🧩 Also works with typed commands if speech is unavailable.

---

## Tech Stack

- **Frontend**: Vanilla JS + Web Speech APIs + Socket.IO client
- **Backend**: Node.js, Express, Socket.IO
- **Time parsing**: `chrono-node`
- **Persistence**: JSON file via a tiny helper

---

## Getting Started

### 1) Prereqs

- Node.js 18+ recommended
- Chrome (or any browser supporting Web Speech APIs for voice)

### 2) Install

```bash
git clone <this-repo> voxassist
cd voxassist
cp .env.example .env
npm install
```

### 3) Run

```bash
npm start
```

Open http://localhost:3000 in your browser.

Allow microphone access for speech recognition and notification permission if prompted.

## Usage Tips

- Click Start Listening and speak your command.
- Or type a command in Quick Command.

### Try these:

- add note meeting at 4
- add todo prepare slides
- list todos
- set reminder tomorrow 9am to call Ali
- delete todo 1
- read last note

## API (optional)

- GET /api/notes → list notes
- POST /api/notes { text } → add note
- DELETE /api/notes → clear notes
- GET /api/todos → list todos
- POST /api/todos { text } → add todo
- PATCH /api/todos/:id { done?: boolean } → toggle
- DELETE /api/todos/:id → delete
- GET /api/reminders → list (incl. fired)
- POST /api/reminders { message, when } → schedule (when can be natural language, parsed by chrono-node)

Limitations

Speech recognition quality varies by browser/device.

Single-user JSON storage; not intended for concurrent multi-user write loads.

Reminders require the tab to be open to hear spoken notifications (server still marks them fired and emits over sockets).

Security & Privacy

No external AI or cloud TTS/STT services are used by default.

Data is stored locally in DATA_FILE (default ./data.json). Treat it like any local app data.

Future Enhancements

📲 Installable PWA with background notifications.

🗣️ Pluggable STT/TTS providers (e.g., Vosk offline STT, system TTS, or cloud providers when desired).

👥 Multi-user accounts and auth.

🧠 Custom command grammar and wake word.

🌐 i18n: multi-language recognition and voice profiles.

🔔 Email/WhatsApp fallback for reminders.

💾 Switch persistence to SQLite or Postgres with migration script.