// Strips HTML-tag-like sequences and control characters from user-submitted
// free text before it is stored. React already escapes text nodes on render,
// so this isn't closing an active XSS hole in the current UI - it's a
// defense-in-depth guard so stored text stays safe wherever it's read next
// (a future non-React view, an export, a PDF), without altering legitimate
// punctuation like apostrophes or ampersands.
export function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
}
