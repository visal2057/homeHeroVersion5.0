import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../../db/pool.js';
import { env } from '../../config/environment.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, verifyPassword } from '../../utils/passwordUtils.js';
import { generateUserToken } from '../../utils/tokenGenerator.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../emails/email.service.js';
import { logAction } from '../audit/audit.service.js';
import {
  findUserByUsernameOrEmail,
  findUserByEmail,
  findUserById,
  findActiveBan,
  findRoleIdByCode,
  checkTokenExists,
  insertUser,
  insertClientProfile,
  insertClientLocation,
  insertPasswordResetToken,
  findValidResetToken,
  markResetTokenUsed,
  updateUserPassword,
  updateLastLogin,
  insertAuthSession,
  revokeAuthSession,
} from './auth.queries.js';

async function generateUniqueToken() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateUserToken();
    const { rows } = await checkTokenExists(candidate);
    if (rows.length === 0) return candidate;
  }
  throw new AppError('Could not generate a unique user token, please try again', 500);
}

function toPublicUser(user) {
  return {
    userId: user.user_id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role_code,
    userToken: user.user_token,
    accountStatus: user.account_status,
    profileImageUrl: user.profile_image_url,
    // Only meaningful for Service Providers; null for every other role.
    verificationStatus: user.verification_status ?? null,
  };
}

function signSession(user, sessionId) {
  return jwt.sign(
    {
      userId: user.user_id,
      username: user.username,
      role: user.role_code,
      accountStatus: user.account_status,
      verificationStatus: user.verification_status ?? null,
      sid: sessionId,
    },
    env.authSecret,
    { expiresIn: `${env.sessionExpiryDays}d` },
  );
}

// Creates the auth_sessions row this login's JWT is tied to, so the session
// can be individually revoked later (logout, or a ban touching every active
// session for the user) instead of only ever expiring on its own.
async function createSession(userId) {
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(sessionSecret).digest('hex');
  const expiresAt = new Date(Date.now() + env.sessionExpiryDays * 24 * 60 * 60 * 1000);

  const { rows } = await insertAuthSession({ userId, refreshTokenHash, expiresAt });
  return rows[0].session_id;
}

export async function registerClient(input) {
  const { rows: existingUsername } = await findUserByUsernameOrEmail(input.username);
  if (existingUsername.length > 0) {
    throw new AppError('Username is already taken', 409);
  }

  const { rows: existingEmail } = await findUserByEmail(input.email);
  if (existingEmail.length > 0) {
    throw new AppError('Email is already registered', 409);
  }

  const { rows: roleRows } = await findRoleIdByCode('CLIENT');
  if (roleRows.length === 0) {
    throw new AppError('Client role is not configured', 500);
  }

  const passwordHash = await hashPassword(input.password);
  const userToken = await generateUniqueToken();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: userRows } = await insertUser(client, {
      roleId: roleRows[0].role_id,
      username: input.username,
      email: input.email,
      passwordHash,
      userToken,
      fullName: input.fullName,
      phone: input.phone,
    });
    const user = userRows[0];

    await insertClientProfile(client, user.user_id);
    await insertClientLocation(client, {
      userId: user.user_id,
      addressText: input.addressText,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    await client.query('COMMIT');

    await sendWelcomeEmail(user);

    await logAction({
      actorUserId: user.user_id,
      actionCode: 'CLIENT_REGISTERED',
      entityType: 'user',
      entityId: user.user_id,
      description: `${user.full_name} registered as a new Client`,
    });

    return toPublicUser({ ...user, role_code: 'CLIENT' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function login({ identifier, password }) {
  const { rows } = await findUserByUsernameOrEmail(identifier);
  if (rows.length === 0) {
    throw new AppError('Invalid username or password', 401);
  }

  const user = rows[0];
  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid username or password', 401);
  }

  if (user.account_status === 'DEACTIVATED') {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  const { rows: banRows } = await findActiveBan(user.user_id);
  if (banRows.length > 0) {
    const ban = banRows[0];
    const message =
      ban.ban_type === 'TEMPORARY'
        ? `Your account is temporarily banned until ${new Date(ban.ends_at).toLocaleString()}. Reason: ${ban.reason}`
        : `Your account has been permanently banned. Reason: ${ban.reason}`;
    throw new AppError(message, 403);
  }

  await updateLastLogin(user.user_id);

  const sessionId = await createSession(user.user_id);
  const token = signSession(user, sessionId);
  return { token, user: toPublicUser(user) };
}

export async function logout(userId, sessionId) {
  if (!sessionId) return;
  await revokeAuthSession(sessionId, userId);
}

export async function getCurrentUser(userId) {
  const { rows } = await findUserById(userId);
  if (rows.length === 0) {
    throw new AppError('User not found', 404);
  }
  return toPublicUser(rows[0]);
}

export async function forgotPassword(email) {
  const { rows } = await findUserByEmail(email);
  if (rows.length === 0) {
    return;
  }

  const user = rows[0];
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + env.passwordResetExpiryMinutes * 60 * 1000);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await insertPasswordResetToken(client, { userId: user.user_id, tokenHash, expiresAt });
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const resetLink = `${env.primaryClientUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user, resetLink);
}

export async function resetPassword({ token, password }) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const { rows } = await findValidResetToken(tokenHash);

  if (rows.length === 0) {
    throw new AppError('This reset link is invalid or has expired', 400);
  }

  const resetRecord = rows[0];
  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await updateUserPassword(client, resetRecord.user_id, passwordHash);
    await markResetTokenUsed(client, resetRecord.password_reset_id);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
