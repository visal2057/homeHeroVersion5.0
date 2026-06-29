import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as bookingService from './booking.service.js';

export const createBookingHandler = asyncHandler(async (req, res) => {
  const result = await bookingService.createBooking(req.user.userId, req.body, req.files ?? []);
  sendSuccess(res, result, 201);
});

export const listMyBookingsHandler = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getClientBookings(req.user.userId);
  sendSuccess(res, bookings);
});

export const cancelBookingHandler = asyncHandler(async (req, res) => {
  const result = await bookingService.cancelBooking(req.params.bookingId, req.user.userId, req.body.reason);
  sendSuccess(res, result);
});
