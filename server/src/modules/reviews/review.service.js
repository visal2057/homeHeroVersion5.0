import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import {
  getReviewBookingContext,
  insertReview,
  markBookingCompleted,
} from './review.queries.js';

// Create a review and complete the booking. The two writes happen in one
// transaction so we never end up with a review on a still-Accepted booking.
export async function submitReview(input, clientUserId) {
  const { bookingId, rating, reviewText } = input;

  const { rows } = await getReviewBookingContext(bookingId);
  const ctx = rows[0];

  // The same checks the spec lists for the review step.
  if (!ctx) throw new AppError('Booking not found', 404);
  if (Number(ctx.client_user_id) !== Number(clientUserId)) {
    throw new AppError('You can only review your own bookings', 403);
  }
  if (ctx.booking_status !== 'ACCEPTED') {
    throw new AppError(`This booking cannot be reviewed (status: ${ctx.booking_status})`, 409);
  }
  if (!ctx.booking_payment_id) {
    throw new AppError('Please complete payment before leaving a review', 409);
  }
  if (ctx.review_id) {
    throw new AppError('You have already reviewed this booking', 409);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: reviewRows } = await insertReview(client, bookingId, rating, reviewText);
    const { rows: bookingRows } = await markBookingCompleted(client, bookingId);
    await client.query('COMMIT');

    // The provider's average rating and completed-job count update
    // automatically through the database views, so nothing else to do here.
    return {
      reviewId: reviewRows[0].review_id,
      bookingId: bookingRows[0].booking_id,
      status: bookingRows[0].booking_status,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
