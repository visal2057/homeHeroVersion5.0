import { AppError } from '../../utils/AppError.js';
import {
  insertNotification,
  getNotificationsForUser,
  markNotificationAsRead,
} from './notification.queries.js';
import { getActiveAnnouncementsForRole, markRead as markAnnouncementRead } from '../announcements/announcement.service.js';
import { findBookingStatusesByIds } from '../bookings/booking.queries.js';

const RESCHEDULE_PROPOSED = 'BOOKING_RESCHEDULE_PROPOSED';

// A reschedule-proposal notification's actionability can't be tracked on
// the client (a page refresh loses any in-memory "already responded" state,
// and the notification's own relatedType never changes once resolved) --
// this looks up the underlying booking's *current* status so the bell can
// correctly decide whether Accept/Reject still make sense, every time it
// fetches, regardless of refreshes or other sessions.
async function annotateRescheduleActionability(notifications) {
  const bookingIds = [...new Set(
    notifications.filter((n) => n.relatedType === RESCHEDULE_PROPOSED).map((n) => n.relatedId),
  )];
  if (bookingIds.length === 0) return notifications;

  const { rows } = await findBookingStatusesByIds(bookingIds);
  const statusByBookingId = new Map(rows.map((r) => [String(r.booking_id), r.booking_status]));

  return notifications.map((n) => ({
    ...n,
    actionable: n.relatedType === RESCHEDULE_PROPOSED
      ? statusByBookingId.get(String(n.relatedId)) === 'RESCHEDULE_PENDING'
      : undefined,
  }));
}

// Called by any module to raise a personal notification for one user.
// Currently only Visal's payment-received event uses this.
export async function createNotification({ recipientUserId, title, message, relatedType, relatedId }) {
  const { rows } = await insertNotification({ recipientUserId, title, message, relatedType, relatedId });
  return { notificationId: rows[0].notification_id };
}

export async function listNotifications(userId) {
  const { rows } = await getNotificationsForUser(userId);
  return rows.map((row) => ({
    notificationId: row.notification_id,
    title: row.title,
    message: row.message,
    relatedType: row.related_type,
    relatedId: row.related_id,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
}

export async function markAsRead(notificationId, userId) {
  const { rows } = await markNotificationAsRead(notificationId, userId);
  if (!rows[0]) throw new AppError('Notification not found', 404);
  return { notificationId: rows[0].notification_id };
}

// Combined feed for the Client and Service Provider notification bells
// (spec §11 / §45.1 / §92): personal notifications merged with active
// announcements targeted at the caller's role, most recent first, each
// item tagged with its type so the bell can label it correctly.
export async function getCombinedFeed(role, userId) {
  const [announcements, rawNotifications] = await Promise.all([
    getActiveAnnouncementsForRole(role, userId),
    listNotifications(userId),
  ]);
  const notifications = await annotateRescheduleActionability(rawNotifications);

  const feed = [
    ...announcements.map((announcement) => ({
      id: announcement.announcementId,
      // announcementId and notificationId are independent sequences, so the
      // same numeric id can appear in both halves of this feed -- feedKey
      // namespaces by type for a React key that's actually unique. id stays
      // as the raw underlying id since markFeedItemRead looks rows up by it.
      feedKey: `ANNOUNCEMENT-${announcement.announcementId}`,
      type: 'ANNOUNCEMENT',
      title: announcement.title,
      message: announcement.messageBody,
      isRead: announcement.isRead,
      createdAt: announcement.publishedAt ?? announcement.createdAt,
    })),
    ...notifications.map((notification) => ({
      id: notification.notificationId,
      feedKey: `PERSONAL-${notification.notificationId}`,
      type: 'PERSONAL',
      title: notification.title,
      message: notification.message,
      relatedType: notification.relatedType,
      relatedId: notification.relatedId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actionable: notification.actionable,
    })),
  ];

  feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return feed;
}

// One call shape for the frontend regardless of which underlying table the
// item actually lives in -- dispatches to the owning module's own mark-read.
export async function markFeedItemRead(type, id, userId) {
  if (type === 'ANNOUNCEMENT') {
    await markAnnouncementRead(id, userId);
    return { id, type };
  }
  if (type === 'PERSONAL') {
    const result = await markAsRead(id, userId);
    return { id: result.notificationId, type };
  }
  throw new AppError('Unknown notification feed item type', 400);
}
