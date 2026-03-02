# ⌨️ CodeCollab

A real-time collaborative code editor. Multiple users share a room, see each other's cursors, chat, and run code together.

**Live demo →** [code-editor-omega-amber.vercel.app](https://code-editor-omega-amber.vercel.app)

---

## Features

- **Real-time sync** — code, cursor positions, and language changes broadcast instantly via WebSockets
- **Code execution** — runs 10 languages server-side through a JDoodle proxy (JS/TS run locally in-browser)
- **Room ownership** — owner can lock the room (others become read-only), transfer ownership, and broadcast their run output
- **Reconnection recovery** — silent rejoin on disconnect using sessionStorage; no data loss
- **Security** — password-gated rooms, membership check on every write event, language whitelist, per-socket flood protection, input sanitisation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| State | Zustand (split stores: editor, user, chat, typing, toast) |
| Realtime | Socket.IO (client + server) |
| Backend | Node.js, Express |
| Execution | JDoodle API (proxied) |
| Deployment | Vercel (client) · Render (server) |

---

## Project Structure

```
├── client/
│   └── src/
│       ├── components/       # UI — Auth, Chat, Editor, shared
│       ├── hooks/            # useRoom, useReconnection, useResizer
│       ├── services/         # socketService (emit namespace), codeExecutionService
│       ├── store/            # Zustand stores
│       └── types/            # Shared TypeScript interfaces
└── server/
    ├── handlers/             # socketHandlers.js — all Socket.IO events
    ├── models/               # Room.js — pure data class, no I/O
    ├── services/             # RoomService.js — in-memory room registry
    └── utils/                # sanitize.js, validate.js
```

---

## Local Setup

**Prerequisites:** Node.js 18+, a free [JDoodle account](https://www.jdoodle.com/compiler-api) for the API keys.

### 1. Clone

```bash
git clone https://github.com/your-username/code-editor.git
cd code-editor
```

### 2. Server

```bash
cd server
cp .env.example .env      # fill in your JDoodle keys
npm install
npm run dev               # http://localhost:3001
```

**`server/.env`**

```env
PORT=3001
CLIENT_URL=http://localhost:5173
JDOODLE_CLIENT_ID=your_id
JDOODLE_CLIENT_SECRET=your_secret
```

### 3. Client

```bash
cd client
cp .env.example .env      # VITE_BACKEND_URL=http://localhost:3001
npm install
npm run dev               # http://localhost:5173
```

---

## Architecture Notes

**`socket.data` instead of a UserService Map**
Username lives on `socket.data`. No manual cleanup on disconnect — GC handles it. Compatible with the Socket.IO Redis adapter for horizontal scaling without changes.

**Code sync on room create**
The server initialises `room.code` as `''`. On create, the owner immediately pushes their editor content via `code-change` so late joiners receive real code, not a blank editor.

**Language change emits both `language-change` and `code-change`**
Switching language resets the local editor to the default snippet and broadcasts both events — keeping `room.code` on the server and every client's editor in sync simultaneously.

**Remote cursors**
Appear only while a user is actively editing (throttled to ~12fps client-side, 15/sec server-side). Auto-hide after 3 seconds of inactivity. Uses Monaco's `createDecorationsCollection` — one collection per user, `.set()` atomically replaces decorations with no stale IDs.

---

## Supported Languages

JavaScript · TypeScript · Python · Java · C++ · C# · PHP · Ruby · Go · Rust

JS and TS execute in-browser. All others run via the JDoodle proxy.

> JDoodle free tier: 200 executions/day.

---

## Known Limitations

- Room state is in-memory — a server restart clears all active rooms
- Username uniqueness is per-process; multi-instance deployments would need a Redis Set
- No persistent chat history — messages exist only for the current session

---
