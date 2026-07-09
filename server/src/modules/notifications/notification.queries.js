import { query } from '../../db/query.js';

// Starter implementation of the shared personal notification system
// (owned by Vihas in the team's module split). Built here just enough to
// unblock Visal's payment-received trigger; Vihas owns extending this --
// e.g. merging with announcements into one combined feed for the bells.

export function insertNotification({ recipientUserId, title, message, relatedType, relatedId }) {
  return query(
    `INSERT INTO notifications (recipient_user_id, title, message, related_type, related_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING notification_id`,
    [recipientUserId, title, message, relatedType ?? null, relatedId ?? null],
  );
}

export function getNotificationsForUser(userId) {
  return query(
    `SELECT notification_id, title, message, related_type, related_id, is_read, created_at
     FROM notifications
     WHERE recipient_user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
}

export function markNotificationAsRead(notificationId, userId) {
  return query(
    `UPDATE notifications
     SET is_read = true
     WHERE notification_id = $1 AND recipient_user_id = $2
     RETURNING notification_id`,
    [notificationId, userId],
  );
}
