import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as chatService from './chat.service.js';

// GET /api/chat/conversations
export const listConversationsHandler = asyncHandler(async (req, res) => {
  const data = await chatService.listConversations(req.user.userId);
  sendSuccess(res, data);
});

// GET /api/chat/bookings/:bookingId/messages?after=<messageId>
export const listMessagesHandler = asyncHandler(async (req, res) => {
  const after = req.query.after ? Number(req.query.after) : undefined;
  const data = await chatService.listMessages(req.params.bookingId, req.user.userId, after);
  sendSuccess(res, data);
});

// POST /api/chat/bookings/:bookingId/messages
export const sendMessageHandler = asyncHandler(async (req, res) => {
  const data = await chatService.sendMessage(req.params.bookingId, req.user.userId, req.body.text);
  sendSuccess(res, data, 201);
});

// GET /api/chat/bookings/:bookingId/job-details
export const jobDetailsHandler = asyncHandler(async (req, res) => {
  const data = await chatService.getJobDetails(req.params.bookingId, req.user.userId);
  sendSuccess(res, data);
});

// PATCH /api/chat/bookings/:bookingId/read
export const markReadHandler = asyncHandler(async (req, res) => {
  const data = await chatService.markRead(req.params.bookingId, req.user.userId);
  sendSuccess(res, data);
});

// GET /api/chat/unread-count
export const unreadCountHandler = asyncHandler(async (req, res) => {
  const data = await chatService.getUnreadCount(req.user.userId);
  sendSuccess(res, data);
});
