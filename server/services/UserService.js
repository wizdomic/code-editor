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

  isUserNameTaken(name) {
    for (const user of this.users.values()) {
      if (user.toLowerCase() === name.toLowerCase()) return true;
    }
    return false;
  }
}

export default new UserService();
