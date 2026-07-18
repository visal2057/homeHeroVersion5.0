import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { AppError } from '../../utils/AppError.js';
import { query } from '../../db/query.js';

async function findUserByToken(token) {
  const { rows } = await query(
    `SELECT u.user_id, u.full_name, r.role_code
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     WHERE UPPER(u.user_token) = UPPER($1)`,
    [token.trim()],
  );
  return rows[0] ?? null;
}

export const submitClientComplaintHandler = asyncHandler(async (req, res) => {
  const { token, description, complaintType, bookingId } = req.body;
  const complainantUserId = req.user.userId;

  if (!token || !description) {
    throw new AppError('Provider token and complaint details are required', 400);
  }
  if (description.trim().length < 20) {
    throw new AppError('Please provide more detail (minimum 20 characters)', 422);
  }

  const target = await findUserByToken(token);
  if (!target) throw new AppError('No user found with that token', 404);
  if (target.role_code !== 'SERVICE_PROVIDER') {
    throw new AppError('Complaints can only be submitted against service providers', 422);
  }
  if (Number(target.user_id) === Number(complainantUserId)) {
    throw new AppError('You cannot submit a complaint against yourself', 422);
  }

  let relatedBookingId = null;
  if (bookingId) {
    const { rows: bookingRows } = await query(
      `SELECT booking_id FROM bookings WHERE booking_id = $1 AND client_user_id = $2 AND provider_user_id = $3`,
      [Number(bookingId), complainantUserId, target.user_id],
    );
    if (bookingRows.length === 0) {
      throw new AppError('That booking ID does not match a booking between you and this provider', 422);
    }
    relatedBookingId = bookingRows[0].booking_id;
  }

  const complaintDetails = complaintType
    ? `[${complaintType}] ${description.trim()}`
    : description.trim();

  const { rows } = await query(
    `INSERT INTO complaints (complainant_user_id, target_user_id, complaint_details, related_booking_id)
     VALUES ($1, $2, $3, $4)
     RETURNING complaint_id, complaint_status, submitted_at`,
    [complainantUserId, target.user_id, complaintDetails, relatedBookingId],
  );

  sendSuccess(res, { complaintId: rows[0].complaint_id, status: rows[0].complaint_status }, 201);
});

export const listClientComplaintsHandler = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT c.complaint_id AS id, c.complaint_status AS status,
            c.complaint_details AS description, c.submitted_at AS "createdAt",
            tu.full_name AS "targetName", tu.user_token AS "targetToken"
     FROM complaints c
     JOIN users tu ON tu.user_id = c.target_user_id
     WHERE c.complainant_user_id = $1
     ORDER BY c.submitted_at DESC`,
    [req.user.userId],
  );

  const shaped = rows.map((r) => {
    const match = r.description?.match(/^\[([^\]]+)\] ([\s\S]+)$/);
    return {
      ...r,
      complaintType: match ? match[1] : 'General',
      description: match ? match[2] : r.description,
    };
  });

  sendSuccess(res, shaped);
});
