/**
 * Pure validation functions — return null on success, error string on failure.
 * All in one place so rules stay consistent across handlers.
 */

export function validateUsername(name) {
  if (!name || typeof name !== 'string')       return 'Username is required.';
  if (!/^[a-zA-Z0-9]+$/.test(name))           return 'Username can only contain letters and numbers.';
  if (name.length < 3 || name.length > 20)    return 'Username must be 3–20 characters.';
  if (!/[a-zA-Z]/.test(name))                 return 'Username must contain at least one letter.';
  if (!/[0-9]/.test(name))                    return 'Username must contain at least one number.';
  return null;
}

export function validatePassword(pw) {
  if (!pw || typeof pw !== 'string') return 'Password is required.';
  if (pw.length < 4)                 return 'Password must be at least 4 characters.';
  if (pw.length > 100)               return 'Password too long.';
  return null;
}

export function validateRoomId(id) {
  if (!id || typeof id !== 'string')        return 'Room ID is required.';
  if (!/^[a-zA-Z0-9-]+$/.test(id))         return 'Room ID can only contain letters, numbers, and hyphens.';
  if (id.length < 3 || id.length > 20)     return 'Room ID must be 3–20 characters.';
  return null;
}

// Whitelist prevents arbitrary strings being stored as language
const VALID_LANGUAGES = new Set([
  'javascript', 'typescript', 'python', 'java', 'cpp',
  'csharp', 'php', 'ruby', 'go', 'rust',
]);

export function validateLanguage(lang) {
  if (!VALID_LANGUAGES.has(lang)) return `Unsupported language: ${lang}`;
  return null;
}