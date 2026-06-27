import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as authService from './auth.service.js';

export const registerClientHandler = asyncHandler(async (req, res) => {
  const user = await authService.registerClient(req.body);
  sendSuccess(res, { user }, 201);
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  sendSuccess(res, { token, user });
});

export const meHandler = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);
  sendSuccess(res, { user });
});

export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, {
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, { message: 'Your password has been reset successfully.' });
});
