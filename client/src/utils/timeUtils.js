// Formats a booking's start/end timestamps as a locale time range, e.g.
// "9:00 AM – 10:00 AM". Falls back to just the start time when no end time
// is recorded (bookings created before start/end time tracking was added).
export function formatTimeRange(start, end) {
  if (!start) return null;
  const startLabel = new Date(start).toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit' });
  if (!end) return startLabel;
  const endLabel = new Date(end).toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit' });
  return `${startLabel} – ${endLabel}`;
}
