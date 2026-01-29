import RoomService from "../services/RoomService.js";
import UserService from "../services/UserService.js";

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // --- Username setup ---
    socket.on("set-username", (username) => {
      const cleanName = username?.trim();

      if (!cleanName || cleanName.length < 3 || cleanName.length > 20) {
        socket.emit("error-message", "Username must be 3–20 characters long.");
        return;
      }

      if (UserService.isUserNameTaken(cleanName)) {
        socket.emit(
          "error-message",
          "Username is already taken. Choose another.",
        );
        return;
      }

      UserService.setUsername(socket.id, cleanName);
      socket.emit("username-set", cleanName);
      console.log(`[USERNAME] ${socket.id} → ${cleanName}`);
    });

    // --- Room events ---
    socket.on("join-room", (roomId) => handleJoinRoom(socket, roomId, io));
    socket.on("code-change", (data) => handleCodeChange(socket, data, io));
    socket.on("language-change", (data) =>
      handleLanguageChange(socket, data, io),
    );
    socket.on("chat-message", (message) =>
      handleChatMessage(socket, message, io),
    );

    // --- Disconnects ---
    socket.on("disconnecting", () => handleDisconnecting(socket, io));
    socket.on("disconnect", () => handleDisconnect(socket, io));
  });
}

function handleJoinRoom(socket, roomId, io) {
  const username = UserService.getUsername(socket.id);
  if (!username) {
    socket.emit("error-message", "Please set your username first.");
    return;
  }

  let room = RoomService.getRoom(roomId);

  if (room && room.isUserNameTaken(username)) {
    socket.emit(
      "error-message",
      `A user named "${username}" is already in this room.`,
    );
    return;
  }

  if (!room) {
    room = RoomService.createRoom(roomId);
  }

  socket.join(roomId);
  room.addUser(socket.id, username);

  io.to(roomId).emit("user-joined", {
    username,
    users: room.getUsers(),
    totalUsers: room.getUserCount(),
  });

  socket.emit("initial-state", {
    ...room.getState(),
    users: room.getUsers(),
    totalUsers: room.getUserCount(),
  });

  console.log(`[ROOM] ${username} joined room ${roomId}`);
}

function handleCodeChange(socket, { roomId, code }, io) {
  const room = RoomService.getRoom(roomId);
  if (room) {
    room.updateCode(code);
    socket.to(roomId).emit("code-update", code);
  }
}

function handleLanguageChange(socket, { roomId, language }, io) {
  const room = RoomService.getRoom(roomId);
  if (room) {
    room.updateLanguage(language);
    socket.to(roomId).emit("language-update", language);
  }
}

function handleChatMessage(socket, message, io) {
  const username = UserService.getUsername(socket.id);
  if (!username) {
    socket.emit("error", {
      message: "Username not set. Please set a username first.",
    });
    return;
  }

  const enrichedMessage = { ...message, username, timestamp: Date.now() };

  for (const roomId of socket.rooms) {
    if (roomId === socket.id) continue;
    io.to(roomId).emit("chat-message", enrichedMessage);
  }
}

// --- DISCONNECTING HANDLER ---
function handleDisconnecting(socket, io) {
  const username = UserService.getUsername(socket.id);
  if (!username) return;

  for (const roomId of socket.rooms) {
    if (roomId === socket.id) continue;

    const room = RoomService.getRoom(roomId);
    if (!room) continue;

    room.removeUser(socket.id);

    io.to(roomId).emit("user-left", {
      username,
      users: room.getUsers(),
      totalUsers: room.getUserCount(),
    });

    if (room.isEmpty()) {
      RoomService.removeRoom(roomId);
    }
  }

  UserService.removeUser(socket.id);
}

// --- FINAL DISCONNECT CLEANUP ---
function handleDisconnect(socket) {
  UserService.removeUser(socket.id);
}
