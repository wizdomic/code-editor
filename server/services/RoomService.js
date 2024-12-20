import Room from '../models/Room.js';

class RoomService {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    const room = new Room();
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomOrCreate(roomId) {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }
    return room;
  }

  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  cleanupEmptyRooms() {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.isEmpty()) {
        this.removeRoom(roomId);
      }
    }
  }
}

export default new RoomService();