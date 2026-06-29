import path from 'path';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { AppError } from '../../utils/AppError.js';
import * as clientService from './client.service.js';

export const getProfileHandler = asyncHandler(async (req, res) => {
  const profile = await clientService.getClientProfile(req.user.userId);
  sendSuccess(res, profile);
});

export const updateProfileHandler = asyncHandler(async (req, res) => {
  const profile = await clientService.updateClientProfile(req.user.userId, req.body);
  sendSuccess(res, profile);
});

export const updateProfileImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('A profile image file is required', 422);
  }
  const profileImageUrl = `/public/profile-images/${path.basename(req.file.path)}`;
  const result = await clientService.updateClientProfileImagePath(req.user.userId, profileImageUrl);
  sendSuccess(res, result);
});

export const updateLocationHandler = asyncHandler(async (req, res) => {
  const location = await clientService.updateClientLocation(req.user.userId, req.body);
  sendSuccess(res, location);
});

export const changePasswordHandler = asyncHandler(async (req, res) => {
  await clientService.changeClientPassword(req.user.userId, req.body);
  sendSuccess(res, { message: 'Password updated successfully' });
});
