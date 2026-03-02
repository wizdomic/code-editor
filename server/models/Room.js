const CURSOR_COLORS = [
  '#F87171', '#60A5FA', '#34D399', '#FBBF24',
  '#A78BFA', '#F472B6', '#38BDF8', '#FB923C',
];

const MAX_MEMBERS = 10; // prevent unbounded room growth

/**
 * Room holds all mutable state for one collaborative session.
 * Pure data class — no networking, no socket references.
 * All I/O stays in socketHandlers.
 */
class Room {
  constructor(creatorSocketId, password) {
    this.code            = '';
    this.language        = 'javascript';
    this.password        = password;
    this.isLocked        = false;
    this.creatorSocketId = creatorSocketId;
    this.colorIndex      = 0;

    this.members   = new Map(); // socketId → username
    this.colors    = new Map(); // socketId → hex color
    this.cursors   = new Map(); // socketId → { line, column }
    this.typing    = new Set(); // socketId
    this.joinOrder = [];        // insertion order for ownership transfer
  }

  // ── Membership ──────────────────────────────────────────────────────────────

  isFull() { return this.members.size >= MAX_MEMBERS; }

  addUser(socketId, username) {
    const color = CURSOR_COLORS[this.colorIndex++ % CURSOR_COLORS.length];
    this.members.set(socketId, username);
    this.colors.set(socketId, color);
    this.joinOrder.push(socketId);
  }

  removeUser(socketId) {
    this.members.delete(socketId);
    this.colors.delete(socketId);
    this.cursors.delete(socketId);
    this.typing.delete(socketId);
    this.joinOrder = this.joinOrder.filter(id => id !== socketId);

    // Transfer ownership to the next earliest member
    if (socketId === this.creatorSocketId) {
      const next = this.joinOrder.find(id => this.members.has(id));
      this.creatorSocketId = next ?? null;
    }
  }

  isEmpty()            { return this.members.size === 0; }
  isCreator(socketId)  { return this.creatorSocketId === socketId; }

  isUsernameTaken(username) {
    const lower = username.toLowerCase();
    for (const name of this.members.values())
      if (name.toLowerCase() === lower) return true;
    return false;
  }

  getCreatorUsername() {
    return this.creatorSocketId
      ? (this.members.get(this.creatorSocketId) ?? null)
      : null;
  }

  getMembersWithColors() {
    return Array.from(this.members.entries()).map(([sid, username]) => ({
      username,
      color:     this.colors.get(sid),
      isCreator: sid === this.creatorSocketId,
    }));
  }

  // ── Cursor ──────────────────────────────────────────────────────────────────

  updateCursor(socketId, line, column) {
    if (this.members.has(socketId))
      this.cursors.set(socketId, { line, column });
  }

  // ── Typing ──────────────────────────────────────────────────────────────────

  setTyping(socketId, isTyping) {
    isTyping ? this.typing.add(socketId) : this.typing.delete(socketId);
  }

  getTypingUsernames() {
    return Array.from(this.typing)
      .map(id => this.members.get(id))
      .filter(Boolean);
  }

  // ── Snapshot sent to client on join / reconnect ────────────────────────────

  getState() {
    return {
      code:            this.code,
      language:        this.language,
      isLocked:        this.isLocked,
      creatorUsername: this.getCreatorUsername(),
      usersWithColors: this.getMembersWithColors(),
    };
  }
}

export default Room;