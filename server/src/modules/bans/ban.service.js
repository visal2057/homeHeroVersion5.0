import { AppError } from '../../utils/AppError.js';
import { sendBanEmail } from '../emails/email.service.js';
import { logAction } from '../audit/audit.service.js';
import { findUserDetailById } from '../users/user.queries.js';
import { listPendingBanRequests, applyBan, revokeBan } from './ban.queries.js';

export async function getPendingBanRequests() {
  const { rows } = await listPendingBanRequests();
  return rows.map((row) => ({
    banRequestId: row.ban_request_id,
    complaintId: row.complaint_id,
    banType: row.ban_type,
    requestedEndsAt: row.requested_ends_at,
    reason: row.reason,
    requestStatus: row.request_status,
    createdAt: row.created_at,
    requestedUserId: row.requested_user_id,
    requestedUserName: row.requested_user_name,
    requestedUserToken: row.requested_user_token,
    requestedUserRole: row.requested_user_role,
    requestedByName: row.requested_by_name,
  }));
}

export async function banUser({ userId, banType, endsAt, reason, sourceBanRequestId }, imposedByUserId) {
  if (banType === 'TEMPORARY' && !endsAt) {
    throw new AppError('A temporary ban requires an end date', 422);
  }

  const ban = await applyBan({ userId, imposedByUserId, banType, endsAt, reason, sourceBanRequestId });

  const { rows } = await findUserDetailById(userId);
  const user = rows[0];
  if (user) {
    await sendBanEmail(user, { banType, endsAt, reason });
  }

  await logAction({
    actorUserId: imposedByUserId,
    actionCode: 'USER_BANNED',
    entityType: 'user',
    entityId: userId,
    description: `${user?.full_name ?? 'User'} was ${banType === 'PERMANENT' ? 'permanently' : 'temporarily'} banned`,
    metadata: { banType, reason },
  });

  return ban;
}

export async function unbanUser(userBanId, revokedByUserId) {
  const { rows } = await revokeBan(userBanId, revokedByUserId);
  if (rows.length === 0) {
    throw new AppError('Active ban not found', 404);
  }

  await logAction({
    actorUserId: revokedByUserId,
    actionCode: 'USER_UNBANNED',
    entityType: 'user',
    entityId: rows[0].user_id,
    description: 'A user ban was removed',
  });

  return rows[0];
}
