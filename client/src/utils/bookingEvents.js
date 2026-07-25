// Same-tab signal that a booking's status changed somewhere in the app
// (e.g. a reschedule accepted/rejected from the notification bell), so any
// other already-mounted booking list in this tab can refetch immediately
// instead of waiting for its next poll interval.
const EVENT_NAME = 'hh:bookings-changed';

export function emitBookingsChanged() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function onBookingsChanged(callback) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
