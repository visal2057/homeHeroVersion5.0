import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, verifyPassword } from '../../utils/passwordUtils.js';
import { findUserById, updateUserPassword } from '../auth/auth.queries.js';
import {
  getClientProfileByUserId,
  updateClientBasicInfo,
  updateClientProfileImage,
  upsertClientLocation,
} from './client.queries.js';

function toProfileResponse(row) {
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    userToken: row.user_token,
    profileImageUrl: row.profile_image_url,
    accountStatus: row.account_status,
    location:
      row.latitude != null
        ? {
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            addressText: row.address_text,
            updatedAt: row.location_updated_at,
          }
        : null,
  };
}

export async function getClientProfile(userId) {
  const { rows } = await getClientProfileByUserId(userId);
  if (rows.length === 0) {
    throw new AppError('Client profile not found', 404);
  }
  return toProfileResponse(rows[0]);
}

export async function updateClientProfile(userId, { fullName, phone }) {
  const { rows } = await updateClientBasicInfo(userId, { fullName, phone });
  if (rows.length === 0) {
    throw new AppError('Client profile not found', 404);
  }
  return getClientProfile(userId);
}

export async function updateClientProfileImagePath(userId, profileImageUrl) {
  const { rows } = await updateClientProfileImage(userId, profileImageUrl);
  if (rows.length === 0) {
    throw new AppError('Client profile not found', 404);
  }
  return { profileImageUrl: rows[0].profile_image_url };
}

export async function updateClientLocation(userId, { addressText, latitude, longitude }) {
  const { rows } = await upsertClientLocation(userId, { addressText, latitude, longitude });
  return {
    latitude: Number(rows[0].latitude),
    longitude: Number(rows[0].longitude),
    addressText: rows[0].address_text,
    updatedAt: rows[0].updated_at,
  };
}

export async function changeClientPassword(userId, { currentPassword, newPassword }) {
  const { rows } = await findUserById(userId);
  if (rows.length === 0) {
    throw new AppError('Client profile not found', 404);
  }

  const passwordMatches = await verifyPassword(currentPassword, rows[0].password_hash);
  if (!passwordMatches) {
    throw new AppError('Current password is incorrect', 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(pool, userId, passwordHash);
}
