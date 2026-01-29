# Collaborative Code Editor

## Overview
This project is a **real-time collaborative code editor** where multiple users can join the same room and edit code together. Users can chat, select programming languages, execute code, and share or download their sessions. It’s designed for fast collaboration and demonstrates real-time web technologies.

---

## Problem It Solves
- Developers or students can **collaborate remotely** on code in real-time.  
- Eliminates the need for constant back-and-forth via files or messages.  
- Provides a simple environment to **test code snippets** in multiple languages instantly.  

---

## How It Works
1. **Backend (Node.js + Socket.IO)**
   - Maintains rooms with their code, language, and user list.
   - Listens to events: `set-username`, `join-room`, `code-change`, `language-change`, `chat-message`.
   - Cleans up empty rooms automatically and handles user disconnects.

2. **Frontend (React + Zustand + Socket.IO-Client)**
   - Users log in with a username and join or create a room.
   - Code editor updates propagate in real-time to all room participants.
   - Chat messages are synced across users in the same room.
   - Users can execute code in supported languages and view the output.
   - Language selector allows switching the programming language for the session.

3. **Leave Room Feature**
   - Users can leave the room gracefully without closing the tab.
   - Resets frontend state and notifies backend to remove the user from the room.
   - Keeps room data accurate for remaining participants.

---

## Features
- **Real-time code collaboration**
- **Multi-language support** (JavaScript, Python, Java, C++, C#, PHP, Rust, Go)
- **Chat functionality** for collaboration
- **Code execution** via in-browser JS or Piston API for other languages
- **Language selection**
- **Room sharing** via URL
- **Download code**
- **Leave room gracefully** (new feature)
- Automatic cleanup of empty rooms in every 5 minutes

---

## Tech Stack
- **Frontend:** React, TypeScript, Zustand, Monaco Editor, Socket.IO-Client, TailwindCSS
- **Backend:** Node.js, Express, Socket.IO
- **Code Execution:** Piston API (remote execution for languages other than JS)
- **Deployment:** Vercel (frontend), Render (backend)

---

### Using the App

* Open the frontend URL [Link Here](https://code-editor-omega-amber.vercel.app/).
* Enter a username and create or join a room.
* Collaborate in real-time, chat, select language, execute code.
* Use **Leave Room** button to exit gracefully.

---

## Limitations

* Only basic code execution for supported languages.
* Piston API execution may be slow for large code snippets.
* No authentication beyond username (anyone can join with the same username if allowed).

---

## Future Improvements

* **Authentication & Roles:** Admin, guest, or read-only modes.
* **Persistent storage:** Save room history and code sessions.
* **Advanced editor features:** Linting, autocomplete, debugging.
* **Improved code execution:** Sandboxed server-side execution for JS.
* **UI enhancements:** Better mobile support and theming.

---