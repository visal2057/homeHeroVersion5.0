import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { AppError } from '../../utils/AppError.js';
import { query } from '../../db/query.js';

// A booking has exactly one client and one provider, so the booking ID alone
// is enough to identify who a complaint is against - this also doubles as
// the authorization check (the booking must actually belong to this provider).
async function findBookingWithClient(bookingId, providerUserId) {
  const { rows } = await query(
    `SELECT b.booking_id, b.client_user_id, u.user_token AS client_token
     FROM bookings b
     JOIN users u ON u.user_id = b.client_user_id
     WHERE b.booking_id = $1 AND b.provider_user_id = $2`,
    [bookingId, providerUserId],
  );
  return rows[0] ?? null;
}

export const submitProviderComplaintHandler = asyncHandler(async (req, res) => {
  const { token, description, bookingId } = req.body;
  const complainantUserId = req.user.userId;

  if (!bookingId || !description) {
    throw new AppError('Booking ID and complaint details are required', 400);
  }
  if (description.trim().length < 20) {
    throw new AppError('Please provide more detail (minimum 20 characters)', 422);
  }

  const booking = await findBookingWithClient(Number(bookingId), complainantUserId);
  if (!booking) {
    throw new AppError('No booking with that ID was found for your account', 404);
  }

  // The client token is optional now that the booking ID alone identifies
  // the client - if given anyway, it must actually match that client,
  // otherwise a mismatched token is a sign of a data-entry mistake.
  if (token && token.trim() && booking.client_token.toUpperCase() !== token.trim().toUpperCase()) {
    throw new AppError('That client token does not match the client on this booking', 422);
  }

  const { rows } = await query(
    `INSERT INTO complaints (complainant_user_id, target_user_id, complaint_details, related_booking_id)
     VALUES ($1, $2, $3, $4)
     RETURNING complaint_id, complaint_status, submitted_at`,
    [complainantUserId, booking.client_user_id, description.trim(), booking.booking_id],
  );

  sendSuccess(res, { complaintId: rows[0].complaint_id, status: rows[0].complaint_status }, 201);
});

export const listProviderComplaintsHandler = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT c.complaint_id AS id, c.complaint_status AS status,
            c.complaint_details AS description, c.submitted_at AS "createdAt",
            c.related_booking_id AS "relatedBookingId",
            tu.full_name AS "targetName", tu.user_token AS "targetToken"
     FROM complaints c
     JOIN users tu ON tu.user_id = c.target_user_id
     WHERE c.complainant_user_id = $1
     ORDER BY c.submitted_at DESC`,
    [req.user.userId],
  );

  sendSuccess(res, rows);
});
