import RoomService from '../services/RoomService.js';
import { sanitize } from '../utils/sanitize.js';
import {
  validateUsername, validatePassword,
  validateRoomId,  validateLanguage,
} from '../utils/validate.js';

const MAX_MSG_LEN  = 500;
const MAX_CODE_LEN = 50 * 1024;

const counters = new Map(); // socketId → { event → { n, resetAt } }

function isFlooding(socketId, event, maxPerSec) {
  const now = Date.now();
  if (!counters.has(socketId)) counters.set(socketId, {});
  const c = counters.get(socketId);
  if (!c[event] || now > c[event].resetAt) { c[event] = { n: 1, resetAt: now + 1000 }; return false; }
  return ++c[event].n > maxPerSec;
}

function fail(socket, msg) { socket.emit('error-message', msg); }

function inRoom(socket, roomId) { return socket.rooms.has(roomId); }

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {

    socket.on('disconnect', () => counters.delete(socket.id));

    // ── Username ──────────────────────────────────────────────────────────────
    socket.on('set-username', (raw) => {
      const name = sanitize(raw);
      const err  = validateUsername(name);
      if (err) return fail(socket, err);
      if (socket.data.username?.toLowerCase() === name.toLowerCase())
        return socket.emit('username-set', socket.data.username);
      const taken = [...io.sockets.sockets.values()].some(
        s => s.id !== socket.id && s.data.username?.toLowerCase() === name.toLowerCase()
      );
      if (taken) return fail(socket, 'Username already taken.');
      socket.data.username = name;
      socket.emit('username-set', name);
    });

    // ── Create room ───────────────────────────────────────────────────────────
    socket.on('create-room', ({ roomId, password }) => {
      const { username } = socket.data;
      if (!username) return fail(socket, 'Set your username first.');
      const cleanId = sanitize(roomId);
      const cleanPw = sanitize(password ?? '');
      const idErr = validateRoomId(cleanId);   if (idErr) return fail(socket, idErr);
      const pwErr = validatePassword(cleanPw); if (pwErr) return fail(socket, pwErr);
      if (RoomService.get(cleanId)) return fail(socket, 'Room ID already in use.');
      const room = RoomService.create(cleanId, socket.id, cleanPw);
      socket.join(cleanId);
      room.addUser(socket.id, username);
      socket.emit('initial-state', room.getState());
      console.log(`[CREATE] ${username} → ${cleanId}`);
    });

    // ── Join room ─────────────────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, password }) => {
      const { username } = socket.data;
      if (!username) return fail(socket, 'Set your username first.');
      const cleanId = sanitize(roomId);
      const cleanPw = sanitize(password ?? '');
      const room    = RoomService.get(cleanId);
      if (!room)                          return fail(socket, 'Room not found.');
      if (room.isLocked)                  return fail(socket, 'Room is locked.');
      if (room.isFull())                  return fail(socket, 'Room is full (max 10 users).');
      if (room.password !== cleanPw)      return fail(socket, 'Wrong password.');
      if (room.isUsernameTaken(username)) return fail(socket, `"${username}" is already in this room.`);
      socket.join(cleanId);
      room.addUser(socket.id, username);
      socket.emit('initial-state', room.getState());
      socket.to(cleanId).emit('user-joined', { username, usersWithColors: room.getMembersWithColors() });
      console.log(`[JOIN] ${username} → ${cleanId}`);
    });

    // ── Code change ───────────────────────────────────────────────────────────
    socket.on('code-change', ({ roomId, code }) => {
      if (!inRoom(socket, roomId)) return;
      if (isFlooding(socket.id, 'code', 20)) return;
      if (typeof code !== 'string' || code.length > MAX_CODE_LEN) return;
      const room = RoomService.get(roomId);
      if (!room) return;
      room.code = code;
      socket.to(roomId).emit('code-update', code);
    });

    // ── Language change ───────────────────────────────────────────────────────
    socket.on('language-change', ({ roomId, language }) => {
      if (!inRoom(socket, roomId)) return;
      const lang = sanitize(language);
      if (validateLanguage(lang)) return;
      const room = RoomService.get(roomId);
      if (!room) return;
      room.language = lang;
      socket.to(roomId).emit('language-update', { language: lang, changedBy: socket.data.username });
    });

    // ── Chat ──────────────────────────────────────────────────────────────────
    socket.on('chat-message', ({ text }) => {
      if (isFlooding(socket.id, 'chat', 3)) return;
      const { username } = socket.data;
      if (!username) return;
      const clean = sanitize(text);
      if (!clean || clean.length > MAX_MSG_LEN) return;
      const msg = {
        id: `${Date.now()}-${socket.id.slice(0, 4)}`,
        username, text: clean, timestamp: Date.now(), type: 'user',
      };
      for (const roomId of socket.rooms)
        if (roomId !== socket.id) io.to(roomId).emit('chat-message', msg);
    });

    // ── Typing ────────────────────────────────────────────────────────────────
    socket.on('typing-start', ({ roomId }) => {
      if (!inRoom(socket, roomId) || isFlooding(socket.id, 'typing', 2)) return;
      const room = RoomService.get(roomId);
      if (!room) return;
      room.setTyping(socket.id, true);
      socket.to(roomId).emit('typing-update', { typingUsers: room.getTypingUsernames() });
    });

    socket.on('typing-stop', ({ roomId }) => {
      if (!inRoom(socket, roomId)) return;
      const room = RoomService.get(roomId);
      if (!room) return;
      room.setTyping(socket.id, false);
      socket.to(roomId).emit('typing-update', { typingUsers: room.getTypingUsernames() });
    });

    // ── Cursor ────────────────────────────────────────────────────────────────
    socket.on('cursor-move', ({ roomId, line, column }) => {
      if (!inRoom(socket, roomId) || isFlooding(socket.id, 'cursor', 15)) return;
      const room = RoomService.get(roomId);
      if (!room) return;
      room.updateCursor(socket.id, line, column);
      socket.to(roomId).emit('cursor-update', {
        username: socket.data.username, line, column, color: room.colors.get(socket.id),
      });
    });

    // ── Room lock ─────────────────────────────────────────────────────────────
    socket.on('toggle-room-lock', ({ roomId }) => {
      if (!inRoom(socket, roomId)) return;
      const room = RoomService.get(roomId);
      if (!room || !room.isCreator(socket.id)) return fail(socket, 'Only the owner can lock/unlock.');
      room.isLocked = !room.isLocked;
      io.to(roomId).emit('room-lock-changed', { isLocked: room.isLocked });
    });

    // ── Transfer ownership ────────────────────────────────────────────────────
    // Solves: pair programming handoff, interview takeover, PR walkthrough lead change.
    // Current owner voluntarily passes control to another user in the room.
    socket.on('transfer-ownership', ({ roomId, toUsername }) => {
      if (!inRoom(socket, roomId)) return;
      const room = RoomService.get(roomId);
      if (!room) return;
      if (!room.isCreator(socket.id)) return fail(socket, 'Only the owner can transfer ownership.');

      // Find the target socket by username
      const targetSocket = [...io.sockets.sockets.values()].find(
        s => s.data.username === toUsername && s.rooms.has(roomId)
      );
      if (!targetSocket) return fail(socket, `"${toUsername}" is not in this room.`);

      room.creatorSocketId = targetSocket.id;
      // Also unlock so the new owner has full control immediately
      room.isLocked = false;

      io.to(roomId).emit('owner-changed',    { newOwner: toUsername });
      io.to(roomId).emit('room-lock-changed', { isLocked: false });
      console.log(`[TRANSFER] ${socket.data.username} → ${toUsername} in ${roomId}`);
    });

    // ── Output broadcast ──────────────────────────────────────────────────────
    socket.on('broadcast-output', ({ roomId, output, error }) => {
      if (!inRoom(socket, roomId)) return;
      const room = RoomService.get(roomId);
      if (!room || !room.isCreator(socket.id)) return;
      socket.to(roomId).emit('output-update', {
        output:  typeof output === 'string' ? output.slice(0, 10_000) : '',
        error:   error ?? null,
        runBy:   socket.data.username,
      });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnecting', () => {
      const { username } = socket.data;
      if (!username) return;
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        const room = RoomService.get(roomId);
        if (!room) continue;
        const wasCreator = room.isCreator(socket.id);
        room.removeUser(socket.id);
        io.to(roomId).emit('user-left', { username, usersWithColors: room.getMembersWithColors() });
        io.to(roomId).emit('cursor-remove', { username });
        if (wasCreator && !room.isEmpty())
          io.to(roomId).emit('owner-changed', { newOwner: room.getCreatorUsername() });
        if (room.isEmpty()) { RoomService.remove(roomId); console.log(`[CLOSED] ${roomId}`); }
      }
    });

  });
}