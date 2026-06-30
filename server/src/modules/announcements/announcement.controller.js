import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import {
  listAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  archiveAnnouncement,
  getActiveAnnouncementsForRole,
  markRead,
} from './announcement.service.js';

export const listAnnouncementsHandler = asyncHandler(async (req, res) => {
  const announcements = await listAllAnnouncements(req.query.status);
  sendSuccess(res, { announcements });
});

export const createAnnouncementHandler = asyncHandler(async (req, res) => {
  const announcement = await createAnnouncement(req.body, req.user.userId);
  sendSuccess(res, { announcement }, 201);
});

export const updateAnnouncementHandler = asyncHandler(async (req, res) => {
  const announcement = await updateAnnouncement(Number(req.params.announcementId), req.body, req.user.userId);
  sendSuccess(res, { announcement });
});

export const archiveAnnouncementHandler = asyncHandler(async (req, res) => {
  const announcement = await archiveAnnouncement(Number(req.params.announcementId), req.user.userId);
  sendSuccess(res, { announcement });
});

export const listActiveAnnouncementsHandler = asyncHandler(async (req, res) => {
  const role = req.user?.role ?? 'PUBLIC';
  const announcements = await getActiveAnnouncementsForRole(role, req.user?.userId ?? null);
  sendSuccess(res, { announcements });
});

export const markAnnouncementReadHandler = asyncHandler(async (req, res) => {
  await markRead(Number(req.params.announcementId), req.user.userId);
  sendSuccess(res, {});
});
