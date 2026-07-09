import { query } from '../../db/query.js';

// Everything the invoice screen and PDF need about one booking, scoped by
// booking_id only -- ownership/status are checked in the service layer using
// findBookingForOwnershipCheck (booking.queries.js), same as portfolio posts.
export function findBookingDetailForInvoice(bookingId) {
  return query(
    `SELECT b.booking_id, b.provider_user_id, b.client_user_id, b.job_description,
            b.scheduled_at, b.completed_at, b.booking_status,
            cu.full_name AS client_name,
            pu.full_name AS provider_name,
            sc.category_name AS service_category,
            bl.address_snapshot AS job_location,
            bp.payment_method
     FROM bookings b
     JOIN users cu ON cu.user_id = b.client_user_id
     JOIN users pu ON pu.user_id = b.provider_user_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN booking_locations bl ON bl.booking_id = b.booking_id
     LEFT JOIN booking_payments bp ON bp.booking_id = b.booking_id
     WHERE b.booking_id = $1`,
    [bookingId],
  );
}

export function findInvoiceByBookingId(bookingId) {
  return query('SELECT * FROM invoices WHERE booking_id = $1', [bookingId]);
}

export function insertInvoice({ bookingId, providerUserId, paymentMethod, amount, storagePath }) {
  return query(
    `INSERT INTO invoices (booking_id, provider_user_id, payment_method, amount, storage_path)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [bookingId, providerUserId, paymentMethod, amount, storagePath],
  );
}

// booking_id -> invoice_id lookup for a set of bookings in one round trip,
// so the Completed Jobs list can show Generate/Download without an N+1.
export function findInvoicesForBookings(bookingIds) {
  if (bookingIds.length === 0) return Promise.resolve({ rows: [] });
  return query('SELECT booking_id FROM invoices WHERE booking_id = ANY($1::bigint[])', [bookingIds]);
}
