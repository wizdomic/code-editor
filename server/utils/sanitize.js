/**
 * Strip HTML tags and trim whitespace.
 * Prevents stored XSS — we never render user content as HTML
 * but sanitize defensively at the boundary anyway.
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}