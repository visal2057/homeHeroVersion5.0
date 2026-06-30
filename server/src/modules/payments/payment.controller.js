import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as paymentService from './payment.service.js';

// GET /api/payments/booking/:bookingId
export const getPaymentContextHandler = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentContext(req.params.bookingId, req.user.userId);
  sendSuccess(res, data);
});

// POST /api/payments/cash
export const payCashHandler = asyncHandler(async (req, res) => {
  const data = await paymentService.payWithCash(req.body.bookingId, req.user.userId);
  sendSuccess(res, data, 201);
});

// POST /api/payments/card
export const payCardHandler = asyncHandler(async (req, res) => {
  const data = await paymentService.payWithCard(req.body, req.user.userId);
  sendSuccess(res, data, 201);
});
