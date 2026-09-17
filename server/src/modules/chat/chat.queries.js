import { query } from '../../db/query.js';

export function findMessagesAfter(bookingId, afterId, limit) {
  return query(
    `SELECT chat_message_id, booking_id, sender_user_id, message_text, created_at, read_at
     FROM chat_messages
     WHERE booking_id = $1 AND chat_message_id > $2
     ORDER BY chat_message_id ASC
     LIMIT $3`,
    [bookingId, afterId, limit],
  );
}

export function insertMessage(bookingId, senderUserId, text) {
  return query(
    `INSERT INTO chat_messages (booking_id, sender_user_id, message_text)
     VALUES ($1, $2, $3)
     RETURNING chat_message_id, booking_id, sender_user_id, message_text, created_at, read_at`,
    [bookingId, senderUserId, text],
  );
}

export function markMessagesRead(bookingId, userId) {
  return query(
    `UPDATE chat_messages
     SET read_at = now()
     WHERE booking_id = $1 AND sender_user_id != $2 AND read_at IS NULL
     RETURNING chat_message_id`,
    [bookingId, userId],
  );
}

export function countUnreadForUser(userId) {
  return query(
    `SELECT count(*) AS unread_count
     FROM chat_messages cm
     JOIN bookings b ON b.booking_id = cm.booking_id
     WHERE cm.read_at IS NULL
       AND cm.sender_user_id != $1
       AND (b.client_user_id = $1 OR b.provider_user_id = $1)`,
    [userId],
  );
}

// Backs the "Job details" popover on an open chat - the job description plus
// its attached images, ordered the same way the booking's own pages show
// them (see booking.queries.js's getBookingImages).
export function findJobDetailsForBooking(bookingId) {
  return query(
    `SELECT b.job_description, b.booking_status, sc.category_name AS service_category,
            COALESCE(
              (SELECT json_agg(bi.storage_path ORDER BY bi.display_order)
               FROM booking_images bi WHERE bi.booking_id = b.booking_id),
              '[]'
            ) AS images
     FROM bookings b
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     WHERE b.booking_id = $1`,
    [bookingId],
  );
}

// One row per booking the caller participates in that's ever had chat access
// (ACCEPTED or COMPLETED), with the counterpart's identity, the last message
// (if any - a booking with no messages yet still shows up, so the Chat page
// can be used to *start* a conversation from a current job, not just resume
// one), and the caller's own unread count for that thread.
export function findConversationsForUser(userId) {
  return query(
    `SELECT
       b.booking_id,
       b.booking_status,
       sc.category_name AS service_category,
       counterpart.user_id AS counterpart_user_id,
       counterpart.full_name AS counterpart_name,
       counterpart.profile_image_url AS counterpart_photo,
       lm.message_text AS last_message_text,
       lm.created_at AS last_message_at,
       lm.sender_user_id AS last_message_sender_user_id,
       COALESCE(unread.unread_count, 0) AS unread_count
     FROM bookings b
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     JOIN users counterpart
       ON counterpart.user_id = (CASE WHEN b.client_user_id = $1 THEN b.provider_user_id ELSE b.client_user_id END)
     LEFT JOIN LATERAL (
       SELECT message_text, created_at, sender_user_id
       FROM chat_messages
       WHERE booking_id = b.booking_id
       ORDER BY chat_message_id DESC
       LIMIT 1
     ) lm ON true
     LEFT JOIN LATERAL (
       SELECT count(*) AS unread_count
       FROM chat_messages
       WHERE booking_id = b.booking_id AND sender_user_id != $1 AND read_at IS NULL
     ) unread ON true
     WHERE (b.client_user_id = $1 OR b.provider_user_id = $1)
       AND b.booking_status IN ('ACCEPTED', 'COMPLETED')
     ORDER BY COALESCE(lm.created_at, b.accepted_at) DESC`,
    [userId],
  );
}
