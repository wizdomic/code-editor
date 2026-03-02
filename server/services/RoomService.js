import Room from '../models/Room.js';

const rooms = new Map(); // roomId → Room

export default {
  create(roomId, creatorSocketId, password) {
    const room = new Room(creatorSocketId, password);
    rooms.set(roomId, room);
    return room;
  },

  get(roomId) {
    return rooms.get(roomId) ?? null;
  },

  remove(roomId) {
    rooms.delete(roomId);
  },
};