import { query } from '../../db/query.js';

export function insertAuditLog({ actorUserId, actionCode, entityType, entityId, description, metadata }) {
  return query(
    `INSERT INTO audit_logs (actor_user_id, action_code, entity_type, entity_id, description, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [actorUserId ?? null, actionCode, entityType, entityId ?? null, description, metadata ? JSON.stringify(metadata) : null],
  );
}

export function listRecentAuditLogs(limit = 10) {
  return query(
    `SELECT al.audit_log_id, al.action_code, al.entity_type, al.entity_id, al.description,
            al.metadata, al.created_at, u.full_name AS actor_name, u.username AS actor_username
     FROM audit_logs al
     LEFT JOIN users u ON u.user_id = al.actor_user_id
     ORDER BY al.created_at DESC
     LIMIT $1`,
    [limit],
  );
}
