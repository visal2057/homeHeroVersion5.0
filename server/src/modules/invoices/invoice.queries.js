import { query } from '../../db/query.js';

// Everything the Create Invoice page needs to autofill from, plus whatever
// invoice (if any) already exists for this booking. Mirrors the shape of
// payment.queries.js::getBookingPaymentContext.
export function getBookingForInvoice(bookingId) {
  return query(
    `SELECT b.booking_id, b.provider_user_id, b.client_user_id, b.job_description,
            b.scheduled_at, b.completed_at, b.booking_status,
            pu.full_name AS provider_name,
            cu.full_name AS client_name,
            sc.category_name,
            bl.address_snapshot,
            bp.payment_method, bp.service_amount,
            inv.invoice_id, inv.storage_path
     FROM bookings b
     JOIN users pu ON pu.user_id = b.provider_user_id
     JOIN users cu ON cu.user_id = b.client_user_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN booking_locations bl ON bl.booking_id = b.booking_id
     LEFT JOIN booking_payments bp ON bp.booking_id = b.booking_id
     LEFT JOIN invoices inv ON inv.booking_id = b.booking_id
     WHERE b.booking_id = $1`,
    [bookingId],
  );
}

export function insertInvoice({ bookingId, providerUserId, paymentMethod, amount, storagePath }) {
  return query(
    `INSERT INTO invoices (booking_id, provider_user_id, payment_method, amount, storage_path)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING invoice_id`,
    [bookingId, providerUserId, paymentMethod, amount, storagePath],
  );
}

// The set of booking IDs this provider already has an invoice for, so the
// Completed Jobs table can show Generate vs Download per row.
export function listInvoicedBookingIdsForProvider(providerUserId) {
  return query(
    `SELECT booking_id FROM invoices WHERE provider_user_id = $1`,
    [providerUserId],
  );
}

export function getInvoiceForDownload(bookingId) {
  return query(
    `SELECT invoice_id, provider_user_id, storage_path FROM invoices WHERE booking_id = $1`,
    [bookingId],
  );
}
