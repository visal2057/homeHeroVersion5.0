import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as reviewService from './review.service.js';

// POST /api/reviews
export const submitReviewHandler = asyncHandler(async (req, res) => {
  const data = await reviewService.submitReview(req.body, req.user.userId);
  sendSuccess(res, data, 201);
});
