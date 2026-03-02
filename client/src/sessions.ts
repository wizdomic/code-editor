// Persists just enough to silently re-join after a socket reconnect.
// Intentional leave clears this so the login form shows correctly.

const KEY = 'cc_session';

export interface Session {
  username: string;
  roomId: string;
  password: string;
  isOwner: boolean; // whether this socket originally created the room
}

export function saveSession(s: Session) {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}