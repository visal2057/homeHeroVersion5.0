import { query } from '../../db/query.js';

export function adminSearchUsers({ role, search, bookingId, limit = 200 }) {
  const conditions = [`r.role_code IN ('CLIENT', 'SERVICE_PROVIDER')`];
  const params = [];

  if (role) {
    params.push(role);
    conditions.push(`r.role_code = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(u.full_name ILIKE $${params.length} OR u.username ILIKE $${params.length} OR u.user_token ILIKE $${params.length})`);
  }

  if (bookingId) {
    params.push(Number(bookingId));
    conditions.push(
      `EXISTS (SELECT 1 FROM bookings b WHERE b.booking_id = $${params.length} AND (b.client_user_id = u.user_id OR b.provider_user_id = u.user_id))`,
    );
  }

  params.push(limit);

  return query(
    `SELECT u.user_id, u.username, u.full_name, u.email, u.user_token, u.account_status, u.created_at,
            r.role_code,
            spp.verification_status,
            cpm.membership_status,
            ub.user_ban_id, ub.ban_type, ub.ends_at AS ban_ends_at, ub.reason AS ban_reason
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     LEFT JOIN service_provider_profiles spp ON spp.provider_user_id = u.user_id
     LEFT JOIN vw_current_provider_membership cpm ON cpm.provider_user_id = u.user_id
     LEFT JOIN user_bans ub ON ub.user_id = u.user_id AND ub.ban_status = 'ACTIVE'
     WHERE ${conditions.join(' AND ')}
     ORDER BY u.created_at DESC
     LIMIT $${params.length}`,
    params,
  );
}

export function findUserDetailById(userId) {
  return query(
    `SELECT u.user_id, u.username, u.full_name, u.email, u.user_token, u.account_status, u.created_at,
            r.role_code
     FROM users u JOIN roles r ON r.role_id = u.role_id
     WHERE u.user_id = $1`,
    [userId],
  );
}
