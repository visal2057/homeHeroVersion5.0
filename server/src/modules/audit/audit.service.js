import { insertAuditLog, listRecentAuditLogs } from './audit.queries.js';

export async function logAction({ actorUserId, actionCode, entityType, entityId, description, metadata }) {
  try {
    await insertAuditLog({ actorUserId, actionCode, entityType, entityId, description, metadata });
  } catch (err) {
    // Audit logging must never block the action that triggered it.
    console.error('Failed to write audit log', err);
  }
}

export async function getRecentActions(limit = 10) {
  const { rows } = await listRecentAuditLogs(limit);
  return rows.map((row) => ({
    id: row.audit_log_id,
    actionCode: row.action_code,
    entityType: row.entity_type,
    entityId: row.entity_id,
    description: row.description,
    metadata: row.metadata,
    actorName: row.actor_name,
    actorUsername: row.actor_username,
    createdAt: row.created_at,
  }));
}
