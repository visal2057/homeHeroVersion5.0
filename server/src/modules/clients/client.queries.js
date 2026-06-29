import { query } from '../../db/query.js';

export function getClientProfileByUserId(userId) {
  return query(
    `SELECT
       u.user_id, u.username, u.email, u.full_name, u.phone, u.user_token,
       u.profile_image_url, u.account_status, u.created_at,
       cl.latitude, cl.longitude, cl.address_text, cl.updated_at AS location_updated_at
     FROM users u
     LEFT JOIN client_locations cl ON cl.client_user_id = u.user_id
     WHERE u.user_id = $1`,
    [userId],
  );
}

export function updateClientBasicInfo(userId, { fullName, phone }) {
  return query(
    `UPDATE users SET full_name = $1, phone = $2, updated_at = now() WHERE user_id = $3 RETURNING *`,
    [fullName, phone, userId],
  );
}

export function updateClientProfileImage(userId, profileImageUrl) {
  return query(
    `UPDATE users SET profile_image_url = $1, updated_at = now() WHERE user_id = $2 RETURNING profile_image_url`,
    [profileImageUrl, userId],
  );
}

export function upsertClientLocation(userId, { addressText, latitude, longitude }) {
  return query(
    `INSERT INTO client_locations (client_user_id, address_text, latitude, longitude)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (client_user_id)
     DO UPDATE SET address_text = EXCLUDED.address_text,
                   latitude = EXCLUDED.latitude,
                   longitude = EXCLUDED.longitude,
                   updated_at = now()
     RETURNING *`,
    [userId, addressText, latitude, longitude],
  );
}
