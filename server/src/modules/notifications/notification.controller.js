import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as notificationService from './notification.service.js';

// GET /api/notifications
export const listNotificationsHandler = asyncHandler(async (req, res) => {
  const data = await notificationService.listNotifications(req.user.userId);
  sendSuccess(res, data);
});

// PATCH /api/notifications/:notificationId/read
export const markAsReadHandler = asyncHandler(async (req, res) => {
  const data = await notificationService.markAsRead(req.params.notificationId, req.user.userId);
  sendSuccess(res, data);
});
