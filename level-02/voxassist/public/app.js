// VoxAssist frontend
// - Uses Web Speech Recognition (when available) for voice commands
// - Uses Web Speech Synthesis for TTS
// - Talks to Node API for persistence and scheduling
// - Listens to reminders via socket.io and speaks them when due

const transcriptEl = document.getElementById('transcript');
const notesEl = document.getElementById('notes');
const todosEl = document.getElementById('todos');
const remindersEl = document.getElementById('reminders');

const btnListen = document.getElementById('btnListen');
const btnStop = document.getElementById('btnStop');
const btnSpeakHelp = document.getElementById('btnSpeakHelp');

const commandForm = document.getElementById('commandForm');
const commandInput = document.getElementById('commandInput');

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');

const reminderForm = document.getElementById('reminderForm');
const reminderMsg = document.getElementById('reminderMsg');
const reminderWhen = document.getElementById('reminderWhen');

const btnClearNotes = document.getElementById('btnClearNotes');

const socket = io();

socket.on('connect', () => console.log('📡 connected'));
socket.on('reminder:due', (payload) => {
  const msg = `Reminder: ${payload.message}`;
  appendTranscript(`🔔 ${msg} (scheduled for ${new Date(payload.when).toLocaleString()})`);
  speak(msg);
  refreshReminders();
});

// Helpers
function appendTranscript(text) {
  const p = document.createElement('p');
  p.textContent = text;
  transcriptEl.prepend(p);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return alert('Speech Synthesis not supported in this browser.');
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.0;
  utt.pitch = 1.0;
  window.speechSynthesis.speak(utt);
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Loaders
async function refreshNotes() {
  const items = await api('/api/notes');
  notesEl.innerHTML = '';
  for (const n of items) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${n.text}</span><span class="muted">${new Date(n.createdAt).toLocaleString()}</span>`;
    notesEl.appendChild(li);
  }
}

async function refreshTodos() {
  const items = await api('/api/todos');
  todosEl.innerHTML = '';
  for (const t of items) {
    const li = document.createElement('li');
    const left = document.createElement('div');
    const right = document.createElement('div');

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = t.done;
    chk.addEventListener('change', async () => {
      await api(`/api/todos/${t.id}`, { method: 'PATCH', body: { done: chk.checked } });
      refreshTodos();
    });

    left.appendChild(chk);
    const span = document.createElement('span');
    span.textContent = ' ' + t.text;
    if (t.done) span.style.textDecoration = 'line-through';
    left.appendChild(span);

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      await api(`/api/todos/${t.id}`, { method: 'DELETE' });
      refreshTodos();
    });

    right.appendChild(del);

    li.appendChild(left);
    li.appendChild(right);
    todosEl.appendChild(li);
  }
}

async function refreshReminders() {
  const items = await api('/api/reminders');
  remindersEl.innerHTML = '';
  for (const r of items.sort((a,b)=>new Date(b.when)-new Date(a.when))) {
    const li = document.createElement('li');
    const status = r.fired ? '✅ fired' : '⏰ pending';
    li.innerHTML = `<span>${r.message}</span><span class="muted">${new Date(r.when).toLocaleString()} · ${status}</span>`;
    remindersEl.appendChild(li);
  }
}

async function init() {
  await refreshNotes();
  await refreshTodos();
  await refreshReminders();
}
init();

// Command parsing (very simple)
async function handleCommand(raw) {
  const text = (raw || '').trim();
  if (!text) return;

  appendTranscript('🗣️ ' + text);

  // "read last note"
  if (/^read (the )?last note$/i.test(text)) {
    const notes = await api('/api/notes');
    if (notes.length === 0) {
      speak('There are no notes yet.');
    } else {
      speak('Last note: ' + notes[0].text);
    }
    return;
  }

  // "list notes"
  if (/^list notes$/i.test(text)) {
    const notes = await api('/api/notes');
    if (!notes.length) speak('No notes found.');
    else speak(`You have ${notes.length} notes. First: ${notes[0].text}`);
    await refreshNotes();
    return;
  }

  // "clear notes"
  if (/^clear notes$/i.test(text)) {
    await api('/api/notes', { method: 'DELETE' });
    await refreshNotes();
    speak('All notes cleared.');
    return;
  }

  // "add note <...>"
  let m = text.match(/^add note (.+)$/i);
  if (m) {
    const content = m[1].trim();
    await api('/api/notes', { method: 'POST', body: { text: content } });
    await refreshNotes();
    speak('Note added.');
    return;
  }

  // "add todo <...>"
  m = text.match(/^add todo (.+)$/i);
  if (m) {
    const content = m[1].trim();
    await api('/api/todos', { method: 'POST', body: { text: content } });
    await refreshTodos();
    speak('Todo added.');
    return;
  }

  // "list todos"
  if (/^list todos$/i.test(text)) {
    const todos = await api('/api/todos');
    const pending = todos.filter(t => !t.done);
    speak(`You have ${todos.length} todos, ${pending.length} pending.`);
    await refreshTodos();
    return;
  }

  // "delete todo <number>" (by index visible list)
  m = text.match(/^delete todo (\d+)$/i);
  if (m) {
    const idx = Number(m[1]) - 1;
    const todos = await api('/api/todos');
    if (idx >= 0 && idx < todos.length) {
      await api(`/api/todos/${todos[idx].id}`, { method: 'DELETE' });
      await refreshTodos();
      speak('Todo deleted.');
    } else {
      speak('I could not find that todo number.');
    }
    return;
  }

  // "set reminder at <time> to <message>"
  m = text.match(/^set reminder (?:at|on|for|in) (.+?) (?:to|for) (.+)$/i);
  if (m) {
    const when = m[1].trim();
    const message = m[2].trim();
    try {
      const res = await api('/api/reminders', { method: 'POST', body: { message, when } });
      speak('Reminder scheduled for ' + new Date(res.when).toLocaleString());
      await refreshReminders();
    } catch (e) {
      speak('Sorry, I could not understand the time.');
    }
    return;
  }

  // Simple QOL
  if (/^(what time is it|time)$/i.test(text)) {
    const now = new Date();
    speak(`It is ${now.toLocaleTimeString()}.`);
    return;
  }

  if (/^help$/i.test(text)) {
    speakHelp();
    return;
  }

  speak("Sorry, I didn't catch that. Say 'help' for commands.");
}

function speakHelp() {
  const help = [
    "Try: add note buy milk.",
    "Try: list notes, or read last note.",
    "Try: add todo finish report; list todos; delete todo 2.",
    "Try: set reminder in 10 minutes to stretch.",
    "Say: help, or what time is it."
  ].join(' ');
  speak(help);
}

// Web Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = navigator.language || 'en-US';

  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += t;
        appendTranscript('📝 ' + t.trim());
        handleCommand(t.trim().toLowerCase());
      } else {
        interim += t;
      }
    }
  };

  recognition.onstart = () => appendTranscript('🎧 Listening...');
  recognition.onerror = (e) => appendTranscript('⚠️ ' + e.error);
  recognition.onend = () => {
    btnListen.disabled = false;
    btnStop.disabled = true;
    appendTranscript('🛑 Stopped listening.');
  };

  btnListen.addEventListener('click', () => {
    try {
      recognition.start();
      btnListen.disabled = true;
      btnStop.disabled = false;
    } catch (e) {
      appendTranscript('⚠️ Already listening.');
    }
  });
  btnStop.addEventListener('click', () => recognition.stop());
} else {
  appendTranscript('⚠️ Speech recognition not supported in this browser. Use the text command box.');
  btnListen.disabled = true;
  btnStop.disabled = true;
}

// Forms
commandForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = commandInput.value.trim();
  commandInput.value = '';
  if (v) await handleCommand(v);
});

todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = todoInput.value.trim();
  if (!v) return;
  await api('/api/todos', { method: 'POST', body: { text: v } });
  todoInput.value = '';
  await refreshTodos();
});

reminderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = reminderMsg.value.trim();
  const when = reminderWhen.value.trim();
  if (!msg || !when) return;
  try {
    const res = await api('/api/reminders', { method: 'POST', body: { message: msg, when } });
    reminderMsg.value = '';
    reminderWhen.value = '';
    speak('Reminder scheduled for ' + new Date(res.when).toLocaleString());
    await refreshReminders();
  } catch (e) {
    speak('Sorry, I could not understand the time. Try: in 10 minutes, tomorrow 9am, next Monday at 2pm.');
  }
});

btnSpeakHelp.addEventListener('click', speakHelp);

// Ask for notification permission (optional, foreground use)
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
