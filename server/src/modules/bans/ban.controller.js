import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { getPendingBanRequests, banUser, unbanUser } from './ban.service.js';

export const listBanRequestsHandler = asyncHandler(async (req, res) => {
  const banRequests = await getPendingBanRequests();
  sendSuccess(res, { banRequests });
});

export const applyBanHandler = asyncHandler(async (req, res) => {
  const ban = await banUser(req.body, req.user.userId);
  sendSuccess(res, { ban }, 201);
});

export const removeBanHandler = asyncHandler(async (req, res) => {
  const ban = await unbanUser(Number(req.params.userBanId), req.user.userId);
  sendSuccess(res, { ban });
});
