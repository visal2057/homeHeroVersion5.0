const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Backend routes return storage paths relative to the server origin (e.g. "/public/profile-images/x.jpg").
// Prefix them with the API origin so they resolve correctly from the Vite dev server's own origin.
export function getAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
