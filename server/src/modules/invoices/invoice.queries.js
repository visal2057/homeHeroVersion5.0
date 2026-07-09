import { query } from '../../db/query.js';

// NOTE: `bookings` and `payments` are owned by other modules (Tharinsa's
// booking flow, Visal's payment module) and are not yet defined in this
// repository. These queries are written against the column names documented
// in 019_invoice_tables.sql and the system flow spec, so they are ready to
// run as soon as those tables land.

export function findCompletedBookingForInvoice(bookingId, providerId) {
  return query(
    `SELECT
       b.booking_id,
       b.client_id,
       b.provider_id,
       b.service_category_id,
       sc.category_name AS service_category_name,
       b.description AS job_description,
       b.location_address AS job_location,
       b.booking_date,
       b.completion_date,
       b.payment_method,
       b.status,
       cu.full_name AS client_name,
       pu.full_name AS provider_name,
       p.service_amount AS card_service_amount
     FROM bookings b
     JOIN users cu ON cu.user_id = b.client_id
     JOIN users pu ON pu.user_id = b.provider_id
     LEFT JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN payments p ON p.booking_id = b.booking_id
     WHERE b.booking_id = $1 AND b.provider_id = $2`,
    [bookingId, providerId],
  );
}

export function findInvoiceByBookingId(bookingId) {
  return query('SELECT * FROM invoices WHERE booking_id = $1', [bookingId]);
}

export function insertInvoice({ bookingId, providerId, paymentMethod, amount, pdfStoragePath }) {
  return query(
    `INSERT INTO invoices (booking_id, provider_id, payment_method, amount, pdf_storage_path)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [bookingId, providerId, paymentMethod, amount, pdfStoragePath],
  );
}
