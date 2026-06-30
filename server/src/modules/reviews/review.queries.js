import { query } from '../../db/query.js';

// Everything we must check before allowing a review: who owns the booking,
// its status, whether it has been paid, and whether it was already reviewed.
export function getReviewBookingContext(bookingId) {
  return query(
    `SELECT b.booking_id, b.booking_status, b.client_user_id,
            bp.booking_payment_id, r.review_id
     FROM bookings b
     LEFT JOIN booking_payments bp ON bp.booking_id = b.booking_id
     LEFT JOIN reviews r ON r.booking_id = b.booking_id
     WHERE b.booking_id = $1`,
    [bookingId],
  );
}

export function insertReview(executor, bookingId, rating, reviewText) {
  return executor.query(
    `INSERT INTO reviews (booking_id, rating, review_text)
     VALUES ($1, $2, $3)
     RETURNING review_id`,
    [bookingId, rating, reviewText],
  );
}

// Submitting the review is what moves the booking to its final state.
export function markBookingCompleted(executor, bookingId) {
  return executor.query(
    `UPDATE bookings
     SET booking_status = 'COMPLETED', completed_at = now()
     WHERE booking_id = $1
     RETURNING booking_id, booking_status`,
    [bookingId],
  );
}
