import { query } from '../../db/query.js';
import { pool } from '../../db/pool.js';

export function listPendingBanRequests() {
  return query(
    `SELECT br.ban_request_id, br.complaint_id, br.ban_type, br.requested_ends_at, br.reason, br.request_status, br.created_at,
            ru.user_id AS requested_user_id, ru.full_name AS requested_user_name, ru.user_token AS requested_user_token,
            rr.role_code AS requested_user_role,
            rb.full_name AS requested_by_name
     FROM ban_requests br
     JOIN users ru ON ru.user_id = br.requested_user_id
     JOIN roles rr ON rr.role_id = ru.role_id
     JOIN users rb ON rb.user_id = br.requested_by_user_id
     WHERE br.request_status = 'PENDING'
     ORDER BY br.created_at DESC`,
  );
}

export function findActiveBanForUser(userId) {
  return query(`SELECT * FROM user_bans WHERE user_id = $1 AND ban_status = 'ACTIVE'`, [userId]);
}

export async function applyBan({ userId, imposedByUserId, banType, endsAt, reason, sourceBanRequestId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO user_bans (user_id, source_ban_request_id, imposed_by_user_id, ban_type, ends_at, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, sourceBanRequestId ?? null, imposedByUserId, banType, endsAt ?? null, reason],
    );

    await client.query(`UPDATE auth_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);

    await client.query(
      `UPDATE service_provider_profiles SET manual_online = false WHERE provider_user_id = $1`,
      [userId],
    );

    if (sourceBanRequestId) {
      await client.query(
        `UPDATE ban_requests SET request_status = 'IMPLEMENTED', reviewed_by_user_id = $1, reviewed_at = now()
         WHERE ban_request_id = $2`,
        [imposedByUserId, sourceBanRequestId],
      );

      await client.query(
        `UPDATE complaints SET complaint_status = 'RESOLVED', resolved_at = now()
         WHERE complaint_id = (SELECT complaint_id FROM ban_requests WHERE ban_request_id = $1)`,
        [sourceBanRequestId],
      );
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Flips any temporary ban past its end date back out of ACTIVE, so a banned
// user regains access without a System Admin manually unbanning them
// (spec §3.5 / clarification #11). Permanent bans (ends_at IS NULL) never
// match. Returns the affected rows so the caller can audit-log each one.
export function expireDueTemporaryBans() {
  return query(
    `UPDATE user_bans
     SET ban_status = 'EXPIRED'
     WHERE ban_status = 'ACTIVE' AND ban_type = 'TEMPORARY' AND ends_at <= now()
     RETURNING user_ban_id, user_id, ends_at, reason`,
  );
}

export function revokeBan(userBanId, revokedByUserId) {
  return query(
    `UPDATE user_bans SET ban_status = 'REVOKED', revoked_by_user_id = $1, revoked_at = now()
     WHERE user_ban_id = $2 AND ban_status = 'ACTIVE'
     RETURNING *`,
    [revokedByUserId, userBanId],
  );
}
