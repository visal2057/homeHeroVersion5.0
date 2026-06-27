import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { listUsers } from './user.service.js';

export const listUsersHandler = asyncHandler(async (req, res) => {
  const { role, search, bookingId } = req.query;
  const users = await listUsers({ role, search, bookingId });
  sendSuccess(res, { users });
});
