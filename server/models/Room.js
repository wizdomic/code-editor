class Room {
  constructor() {
    this.code = "";
    this.language = "javascript";
    this.users = new Map();
  }

  addUser(socketId, username) {
    if (username) {
      this.users.set(socketId, username);
    }
  }

  removeUser(socketId) {
    this.users.delete(socketId);
  }

  updateCode(code) {
    this.code = code;
  }

  updateLanguage(language) {
    this.language = language;
  }

  isUserNameTaken(username) {
    for (const name of this.users.values()) {
      if (name.toLowerCase() === username.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getUserCount() {
    return this.users.size;
  }

  isEmpty() {
    return this.users.size === 0;
  }

  getState() {
    return {
      code: this.code,
      language: this.language,
      users: this.getUsers(),
      totalUsers: this.getUserCount(),
    };
  }
}

export default Room;
