import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as bookingService from './booking.service.js';

export const listRequestsHandler = asyncHandler(async (req, res) => {
  const requests = await bookingService.getProviderRequests(req.user.userId);
  sendSuccess(res, requests);
});

export const listJobsHandler = asyncHandler(async (req, res) => {
  const jobs = await bookingService.getProviderJobs(req.user.userId);
  sendSuccess(res, jobs);
});

export const listCompletedJobsHandler = asyncHandler(async (req, res) => {
  const jobs = await bookingService.getProviderCompletedJobs(req.user.userId);
  sendSuccess(res, jobs);
});

export const acceptBookingHandler = asyncHandler(async (req, res) => {
  const result = await bookingService.acceptBooking(req.params.bookingId, req.user.userId);
  sendSuccess(res, result);
});

export const rejectBookingHandler = asyncHandler(async (req, res) => {
  const result = await bookingService.rejectBooking(req.params.bookingId, req.user.userId);
  sendSuccess(res, result);
});

export const getStatsHandler = asyncHandler(async (req, res) => {
  const stats = await bookingService.getProviderStats(req.user.userId);
  sendSuccess(res, stats);
});
