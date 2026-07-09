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
