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

// GET /api/notifications/feed
export const getFeedHandler = asyncHandler(async (req, res) => {
  const data = await notificationService.getCombinedFeed(req.user.role, req.user.userId);
  sendSuccess(res, data);
});

// PATCH /api/notifications/feed/:type/:id/read
export const markFeedItemReadHandler = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const data = await notificationService.markFeedItemRead(type.toUpperCase(), id, req.user.userId);
  sendSuccess(res, data);
});
