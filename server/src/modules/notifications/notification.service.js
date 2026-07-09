import { AppError } from '../../utils/AppError.js';
import {
  insertNotification,
  getNotificationsForUser,
  markNotificationAsRead,
} from './notification.queries.js';

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
