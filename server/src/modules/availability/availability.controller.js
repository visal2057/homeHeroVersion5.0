import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as availabilityService from './availability.service.js';

export const toggleAvailabilityHandler = asyncHandler(async (req, res) => {
  const { manualOnline, todayOverride } = req.body;
  const result = typeof todayOverride === 'boolean'
    ? await availabilityService.setTodayOverride(req.user.userId, todayOverride)
    : await availabilityService.toggleManualOnline(req.user.userId, manualOnline);
  sendSuccess(res, result);
});

export const getUnavailableDatesHandler = asyncHandler(async (req, res) => {
  const dates = await availabilityService.getUnavailableDates(req.user.userId);
  sendSuccess(res, dates);
});

export const putUnavailableDatesHandler = asyncHandler(async (req, res) => {
  const dates = await availabilityService.replaceUnavailableDates(req.user.userId, req.body.dates);
  sendSuccess(res, dates);
});
