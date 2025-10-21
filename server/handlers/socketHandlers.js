import RoomService from '../services/RoomService.js';
import UserService from '../services/UserService.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('set-username', (username) => {
      UserService.setUsername(socket.id, username);
    });

    socket.on('join-room', (roomId) => handleJoinRoom(socket, roomId, io));
    socket.on('code-change', (data) => handleCodeChange(socket, data, io));
    socket.on('language-change', (data) => handleLanguageChange(socket, data, io));
    socket.on('chat-message', (message) => handleChatMessage(socket, message, io));
    socket.on('disconnecting', () => handleDisconnecting(socket, io));
    socket.on('disconnect', () => handleDisconnect(socket, io));
  });
}

function handleJoinRoom(socket, roomId, io) {
  socket.join(roomId);
  const room = RoomService.getRoomOrCreate(roomId);
  const username = UserService.getUsername(socket.id);
  
  room.addUser(socket.id, username);
  
  // Broadcast to all clients in the room that a new user joined
  io.to(roomId).emit('user-joined', {
    username,
    users: room.getUsers(),
    totalUsers: room.getUserCount()
  });

  // Send initial state to the joining user
  socket.emit('initial-state', {
    ...room.getState(),
    users: room.getUsers(),
    totalUsers: room.getUserCount()
  });
}

function handleCodeChange(socket, { roomId, code }, io) {
  const room = RoomService.getRoom(roomId);
  if (room) {
    room.updateCode(code);
    // Broadcast code changes to all clients except sender
    socket.to(roomId).emit('code-update', code);
  }
}

function handleLanguageChange(socket, { roomId, language }, io) {
  const room = RoomService.getRoom(roomId);
  if (room) {
    room.updateLanguage(language);
    // Broadcast language changes to all clients except sender
    socket.to(roomId).emit('language-update', language);
  }
}

function handleChatMessage(socket, message, io) {
  const username = UserService.getUsername(socket.id);
  if (!username) return;

  for (const roomId of socket.rooms) {
    const room = RoomService.getRoom(roomId);
    if (room) {
      const enrichedMessage = {
        ...message,
        username,
        timestamp: Date.now()
      };
      // Broadcast message to all clients in the room
      io.to(roomId).emit('chat-message', enrichedMessage);
    }
  }
}

function handleDisconnecting(socket, io) {
  const username = UserService.getUsername(socket.id);
  
  for (const roomId of socket.rooms) {
    const room = RoomService.getRoom(roomId);
    if (room) {
      room.removeUser(socket.id);
      
      // Notify remaining users about the departure
      io.to(roomId).emit('user-left', {
        username,
        users: room.getUsers(),
        totalUsers: room.getUserCount()
      });
      
      if (room.isEmpty()) {
        RoomService.removeRoom(roomId);
      }
    }
  }
}

function handleDisconnect(socket, io) {
  UserService.removeUser(socket.id);
}