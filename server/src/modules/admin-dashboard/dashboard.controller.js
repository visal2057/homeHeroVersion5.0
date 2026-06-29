import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { getDashboardOverview } from './dashboard.service.js';

export const getOverviewHandler = asyncHandler(async (req, res) => {
  const overview = await getDashboardOverview();
  sendSuccess(res, overview);
});
