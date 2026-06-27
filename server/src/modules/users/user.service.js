import { adminSearchUsers } from './user.queries.js';

export async function listUsers({ role, search, bookingId }) {
  const { rows } = await adminSearchUsers({ role, search, bookingId });

  return rows.map((row) => ({
    userId: row.user_id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    userToken: row.user_token,
    role: row.role_code,
    accountStatus: row.account_status,
    createdAt: row.created_at,
    verificationStatus: row.verification_status,
    membershipStatus: row.membership_status,
    isBanned: Boolean(row.user_ban_id),
    ban: row.user_ban_id
      ? { userBanId: row.user_ban_id, banType: row.ban_type, endsAt: row.ban_ends_at, reason: row.ban_reason }
      : null,
  }));
}
