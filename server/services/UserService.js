class UserService {
  constructor() {
    this.users = new Map();
  }

  setUsername(socketId, username) {
    this.users.set(socketId, username);
  }

  getUsername(socketId) {
    return this.users.get(socketId);
  }

  removeUser(socketId) {
    this.users.delete(socketId);
  }
}

export default new UserService();