import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { submitContactMessage } from './contact.service.js';

export const submitContactMessageHandler = asyncHandler(async (req, res) => {
  await submitContactMessage(req.body);
  sendSuccess(res, { message: 'Your message has been sent. We will get back to you soon.' }, 201);
});
