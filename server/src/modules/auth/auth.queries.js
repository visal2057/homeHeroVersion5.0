import { query } from '../../db/query.js';

export function findUserByUsernameOrEmail(identifier) {
  return query(
    `SELECT u.*, r.role_code, spp.verification_status
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     LEFT JOIN service_provider_profiles spp ON spp.provider_user_id = u.user_id
     WHERE u.username = $1 OR u.email = $1`,
    [identifier],
  );
}

export function findUserByEmail(email) {
  return query(
    `SELECT u.*, r.role_code FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.email = $1`,
    [email],
  );
}

export function findUserById(userId) {
  return query(
    `SELECT u.*, r.role_code, spp.verification_status
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     LEFT JOIN service_provider_profiles spp ON spp.provider_user_id = u.user_id
     WHERE u.user_id = $1`,
    [userId],
  );
}

export function findActiveBan(userId) {
  return query(
    `SELECT * FROM user_bans WHERE user_id = $1 AND ban_status = 'ACTIVE'`,
    [userId],
  );
}

// One-query check used on every authenticated request (not just login) so a
// ban, deactivation, or logout invalidates an already-issued session
// immediately. sessionId is the auth_sessions row created at login and
// embedded in the JWT as `sid`; it is left-joined (not inner-joined) so a
// token issued before this check existed still authenticates normally, just
// without the extra revoked-session check.
export function findSessionValidity(userId, sessionId) {
  return query(
    `SELECT u.account_status, ub.ban_type, ub.reason, ub.ends_at, s.revoked_at AS session_revoked_at
     FROM users u
     LEFT JOIN user_bans ub ON ub.user_id = u.user_id AND ub.ban_status = 'ACTIVE'
     LEFT JOIN auth_sessions s ON s.session_id = $2
     WHERE u.user_id = $1`,
    [userId, sessionId ?? null],
  );
}

// Creates the session row a login issues a JWT for. auth_sessions.session_id
// is embedded in that JWT as `sid` so a specific session (not just "all of
// this user's sessions") can be revoked on logout. refresh_token_hash has no
// consumer yet (no refresh-token flow exists), so it is populated with a
// random per-session value only to satisfy the column's NOT NULL/UNIQUE
// constraint.
export function insertAuthSession({ userId, refreshTokenHash, expiresAt }) {
  return query(
    `INSERT INTO auth_sessions (user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING session_id`,
    [userId, refreshTokenHash, expiresAt],
  );
}

// Logout: revokes exactly the session the caller authenticated with.
// Scoped to both session_id and user_id so a session can never be revoked
// by anyone other than the user it belongs to.
export function revokeAuthSession(sessionId, userId) {
  return query(
    `UPDATE auth_sessions SET revoked_at = now()
     WHERE session_id = $1 AND user_id = $2 AND revoked_at IS NULL
     RETURNING session_id`,
    [sessionId, userId],
  );
}

export function findRoleIdByCode(roleCode) {
  return query(`SELECT role_id FROM roles WHERE role_code = $1`, [roleCode]);
}

export function checkTokenExists(userToken) {
  return query(`SELECT 1 FROM users WHERE user_token = $1`, [userToken]);
}

export function insertUser(client, { roleId, username, email, passwordHash, userToken, fullName, phone }) {
  return client.query(
    `INSERT INTO users (role_id, username, email, password_hash, user_token, full_name, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [roleId, username, email, passwordHash, userToken, fullName, phone],
  );
}

export function insertClientProfile(client, userId) {
  return client.query(`INSERT INTO client_profiles (client_user_id) VALUES ($1)`, [userId]);
}

export function insertClientLocation(client, { userId, addressText, latitude, longitude }) {
  return client.query(
    `INSERT INTO client_locations (client_user_id, address_text, latitude, longitude)
     VALUES ($1, $2, $3, $4)`,
    [userId, addressText, latitude, longitude],
  );
}

export function insertPasswordResetToken(client, { userId, tokenHash, expiresAt }) {
  return client.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

export function findValidResetToken(tokenHash) {
  return query(
    `SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [tokenHash],
  );
}

export function markResetTokenUsed(client, passwordResetId) {
  return client.query(
    `UPDATE password_reset_tokens SET used_at = now() WHERE password_reset_id = $1`,
    [passwordResetId],
  );
}

export function updateUserPassword(client, userId, passwordHash) {
  return client.query(`UPDATE users SET password_hash = $1, updated_at = now() WHERE user_id = $2`, [
    passwordHash,
    userId,
  ]);
}

export function updateLastLogin(userId) {
  return query(`UPDATE users SET last_login_at = now() WHERE user_id = $1`, [userId]);
}
