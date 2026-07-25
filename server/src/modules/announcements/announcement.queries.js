import { query } from '../../db/query.js';

export function promoteDueScheduledAnnouncements() {
  return query(
    `UPDATE announcements SET announcement_status = 'ACTIVE', published_at = now()
     WHERE announcement_status = 'SCHEDULED' AND scheduled_for <= now()
     RETURNING announcement_id, title`,
  );
}

export function listAnnouncements({ status }) {
  const conditions = [];
  const params = [];
  if (status) {
    params.push(status);
    conditions.push(`announcement_status = $${params.length}`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`SELECT * FROM announcements ${where} ORDER BY created_at DESC`, params);
}

export function findAnnouncementById(announcementId) {
  return query(`SELECT * FROM announcements WHERE announcement_id = $1`, [announcementId]);
}

export function insertAnnouncement({ title, messageBody, audience, status, scheduledFor, publishedAt, createdByUserId }) {
  return query(
    `INSERT INTO announcements (title, message_body, audience, announcement_status, scheduled_for, published_at, created_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, messageBody, audience, status, scheduledFor ?? null, publishedAt ?? null, createdByUserId],
  );
}

export function updateAnnouncementRow(announcementId, { title, messageBody, audience, status, scheduledFor, publishedAt }) {
  return query(
    `UPDATE announcements
     SET title = $1, message_body = $2, audience = $3, announcement_status = $4,
         scheduled_for = $5, published_at = $6, updated_at = now()
     WHERE announcement_id = $7
     RETURNING *`,
    [title, messageBody, audience, status, scheduledFor ?? null, publishedAt ?? null, announcementId],
  );
}

export function archiveAnnouncementRow(announcementId) {
  return query(
    `UPDATE announcements SET announcement_status = 'ARCHIVED', archived_at = now(), updated_at = now()
     WHERE announcement_id = $1 RETURNING *`,
    [announcementId],
  );
}

export function listActiveForAudience(audiences, userId) {
  return query(
    `SELECT a.*, (ar.user_id IS NOT NULL) AS is_read
     FROM announcements a
     LEFT JOIN announcement_reads ar ON ar.announcement_id = a.announcement_id AND ar.user_id = $2
     WHERE a.announcement_status = 'ACTIVE' AND a.audience = ANY($1::announcement_audience[])
     ORDER BY a.published_at DESC LIMIT 30`,
    [audiences, userId],
  );
}

export function markAnnouncementRead(announcementId, userId) {
  return query(
    `INSERT INTO announcement_reads (announcement_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (announcement_id, user_id) DO NOTHING
     RETURNING *`,
    [announcementId, userId],
  );
}
