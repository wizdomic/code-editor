import { socket } from '../socket';
import type { Message } from '../types/chat';
import type { UserWithColor } from '../store/editorStore';

// ── Emitters ──────────────────────────────────────────────────────────────────

export const emit = {
  codeChange:        (roomId: string, code: string) =>
    socket.emit('code-change', { roomId, code }),

  languageChange:    (roomId: string, language: string) =>
    socket.emit('language-change', { roomId, language }),

  chatMessage:       (message: Message) =>
    socket.emit('chat-message', message),

  cursorMove:        (roomId: string, line: number, column: number) =>
    socket.emit('cursor-move', { roomId, line, column }),

  typingStart:       (roomId: string) =>
    socket.emit('typing-start', { roomId }),

  typingStop:        (roomId: string) =>
    socket.emit('typing-stop', { roomId }),

  toggleLock:        (roomId: string) =>
    socket.emit('toggle-room-lock', { roomId }),

  broadcastOutput:   (roomId: string, output: string, error: string | null, language: string) =>
    socket.emit('broadcast-output', { roomId, output, error, language }),

  transferOwnership: (roomId: string, toUsername: string) =>
    socket.emit('transfer-ownership', { roomId, toUsername }),
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RemoteCursor {
  username: string;
  line:     number;
  column:   number;
  color:    string;
}

export interface RoomListenerOptions {
  onUsersUpdate:    (usersWithColors: UserWithColor[]) => void;
  onCodeUpdate:     (code: string) => void;
  onLanguageUpdate: (language: string, changedBy: string) => void;
  onChatMessage:    (message: Message) => void;
  onCursorUpdate:   (cursor: RemoteCursor) => void;
  onCursorRemove:   (username: string) => void;
  onTypingUpdate:   (typingUsers: string[]) => void;
  onOutputUpdate:   (output: string, error: string | null, runBy: string) => void;
  onLockChange:     (isLocked: boolean, isOwner: boolean) => void;
  onOwnerChange:    (newOwner: string) => void;
  toast:            (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

// ── Listener setup ────────────────────────────────────────────────────────────

export function setupRoomListeners(
  opts: RoomListenerOptions,
  isOwner: () => boolean,
): () => void {
  socket.on('user-joined', ({ username, usersWithColors }) => {
    opts.onUsersUpdate(usersWithColors);
    opts.toast(`${username} joined the room`, 'info');
  });

  socket.on('user-left', ({ username, usersWithColors }) => {
    opts.onUsersUpdate(usersWithColors);
    opts.toast(`${username} left the room`, 'warning');
  });

  socket.on('code-update',     (code: string) => opts.onCodeUpdate(code));

  socket.on('language-update', ({ language, changedBy }: { language: string; changedBy: string }) => {
    opts.onLanguageUpdate(language, changedBy);
    if (changedBy) opts.toast(`${changedBy} switched to ${language}`, 'info');
  });

  socket.on('chat-message',  (m: Message)      => opts.onChatMessage(m));
  socket.on('cursor-update', (c: RemoteCursor)  => opts.onCursorUpdate(c));
  socket.on('cursor-remove', ({ username }: { username: string }) => opts.onCursorRemove(username));
  socket.on('typing-update', ({ typingUsers }: { typingUsers: string[] }) => opts.onTypingUpdate(typingUsers));

  socket.on('output-update', ({ output, error, runBy }: { output: string; error: string | null; runBy: string }) => {
    opts.onOutputUpdate(output, error, runBy);
    opts.toast(`${runBy} ran the code`, 'info');
  });

  socket.on('room-lock-changed', ({ isLocked }: { isLocked: boolean }) => {
    const owner = isOwner();
    opts.onLockChange(isLocked, owner);
    opts.toast(
      isLocked
        ? (owner ? '🔒 Room locked — others are read-only' : '🔒 Room locked — you are read-only')
        : '🔓 Room unlocked — everyone can edit',
      isLocked ? 'warning' : 'success',
    );
  });

  socket.on('owner-changed', ({ newOwner }: { newOwner: string }) => {
    opts.onOwnerChange(newOwner);
    opts.toast(`👑 ${newOwner} is now the room owner`, 'info');
  });

  return () => {
    [
      'user-joined', 'user-left', 'code-update', 'language-update',
      'chat-message', 'cursor-update', 'cursor-remove', 'typing-update',
      'output-update', 'room-lock-changed', 'owner-changed',
    ].forEach(ev => socket.off(ev));
  };
}