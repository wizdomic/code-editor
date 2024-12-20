import { socket } from '../socket';
import { Message } from '../types/chat';

export const emitJoinRoom = (roomId: string) => {
  socket.emit('join-room', roomId);
};

export const emitCodeChange = (roomId: string, code: string) => {
  socket.emit('code-change', { roomId, code });
};

export const emitLanguageChange = (roomId: string, language: string) => {
  socket.emit('language-change', { roomId, language });
};

export const emitChatMessage = (message: Message) => {
  socket.emit('chat-message', message);
};

export const emitSetUsername = (username: string) => {
  socket.emit('set-username', username);
};

interface UserUpdate {
  username: string;
  users: string[];
  totalUsers: number;
}

export const setupSocketListeners = (
  setUsers: (users: string[]) => void,
  setCode: (code: string) => void,
  setLanguage: (language: string) => void,
  addMessage: (message: Message) => void,
  addSystemMessage: (text: string) => void
) => {
  socket.on('user-joined', ({ username, users, totalUsers }: UserUpdate) => {
    setUsers(users);
    addSystemMessage(`${username} joined the room (${totalUsers} users online)`);
  });

  socket.on('user-left', ({ username, users, totalUsers }: UserUpdate) => {
    setUsers(users);
    addSystemMessage(`${username} left the room (${totalUsers} users online)`);
  });

  socket.on('initial-state', ({ code, language, users }) => {
    setCode(code);
    setLanguage(language);
    setUsers(users);
  });

  socket.on('code-update', (newCode: string) => {
    setCode(newCode);
  });

  socket.on('language-update', (newLanguage: string) => {
    setLanguage(newLanguage);
  });

  socket.on('chat-message', (message: Message) => {
    addMessage(message);
  });

  return () => {
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('initial-state');
    socket.off('code-update');
    socket.off('language-update');
    socket.off('chat-message');
  };
};