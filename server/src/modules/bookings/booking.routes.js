import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient } from '../../middleware/requireClient.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { uploadBookingImages } from '../../middleware/uploadFiles.js';
import { createBookingSchema, cancelBookingSchema } from './booking.validation.js';
import {
  createBookingHandler,
  listMyBookingsHandler,
  cancelBookingHandler,
} from './clientBooking.controller.js';
import {
  listRequestsHandler,
  listJobsHandler,
  listCompletedJobsHandler,
  acceptBookingHandler,
  rejectBookingHandler,
  getStatsHandler,
} from './providerBooking.controller.js';

// Client-facing booking actions: mounted at /api/bookings
export const clientBookingRouter = Router();
clientBookingRouter.use(authenticate, requireClient);
clientBookingRouter.post(
  '/',
  uploadBookingImages,
  validateRequest(createBookingSchema),
  createBookingHandler,
);
clientBookingRouter.get('/mine', listMyBookingsHandler);
clientBookingRouter.patch('/:bookingId/cancel', validateRequest(cancelBookingSchema), cancelBookingHandler);

// Provider-facing booking actions: mounted at /api/provider
export const providerBookingRouter = Router();
providerBookingRouter.use(authenticate, requireProvider);
providerBookingRouter.get('/bookings', listRequestsHandler);
providerBookingRouter.get('/jobs', listJobsHandler);
providerBookingRouter.get('/completed-jobs', listCompletedJobsHandler);
providerBookingRouter.get('/stats', getStatsHandler);
providerBookingRouter.patch('/bookings/:bookingId/accept', acceptBookingHandler);
providerBookingRouter.patch('/bookings/:bookingId/reject', rejectBookingHandler);
