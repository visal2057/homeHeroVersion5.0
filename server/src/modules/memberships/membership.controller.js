import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as membershipService from './membership.service.js';

// GET /api/memberships/me -> current membership + next price + history
export const getMembershipOverviewHandler = asyncHandler(async (req, res) => {
  const data = await membershipService.getMembershipOverview(req.user.userId);
  sendSuccess(res, data);
});

// POST /api/memberships/purchase -> buy or renew by card
export const purchaseMembershipHandler = asyncHandler(async (req, res) => {
  const data = await membershipService.purchaseMembership(req.body, req.user.userId);
  sendSuccess(res, data, 201);
});
