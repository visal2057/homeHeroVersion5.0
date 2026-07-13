import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { searchProviderJobs } from './sp-tracking.service.js';

// GET /api/system-admin/sp-tracking?search=<name or token>
export const searchSPTrackingHandler = asyncHandler(async (req, res) => {
  const result = await searchProviderJobs(req.query.search);
  sendSuccess(res, result);
});
