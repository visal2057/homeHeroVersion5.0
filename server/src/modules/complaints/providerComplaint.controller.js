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

export const submitProviderComplaintHandler = asyncHandler(async (req, res) => {
  const { token, description } = req.body;
  const complainantUserId = req.user.userId;

  if (!token || !description) {
    throw new AppError('Client token and complaint details are required', 400);
  }
  if (description.trim().length < 20) {
    throw new AppError('Please provide more detail (minimum 20 characters)', 422);
  }

  const target = await findUserByToken(token);
  if (!target) throw new AppError('No user found with that token', 404);
  if (target.role_code !== 'CLIENT') {
    throw new AppError('Complaints can only be submitted against clients', 422);
  }
  if (Number(target.user_id) === Number(complainantUserId)) {
    throw new AppError('You cannot submit a complaint against yourself', 422);
  }

  const { rows } = await query(
    `INSERT INTO complaints (complainant_user_id, target_user_id, complaint_details)
     VALUES ($1, $2, $3)
     RETURNING complaint_id, complaint_status, submitted_at`,
    [complainantUserId, target.user_id, description.trim()],
  );

  sendSuccess(res, { complaintId: rows[0].complaint_id, status: rows[0].complaint_status }, 201);
});

export const listProviderComplaintsHandler = asyncHandler(async (req, res) => {
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

  sendSuccess(res, rows);
});
