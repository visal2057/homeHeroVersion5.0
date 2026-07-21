import { query } from '../../db/query.js';

export function getClientProfileByUserId(userId) {
  return query(
    `SELECT
       u.user_id, u.username, u.email, u.full_name, u.phone, u.user_token,
       u.profile_image_url, u.account_status, u.created_at,
       cp.latitude AS primary_latitude, cp.longitude AS primary_longitude,
       cp.address_text AS primary_address_text, cp.updated_at AS primary_location_updated_at,
       cs.latitude AS secondary_latitude, cs.longitude AS secondary_longitude,
       cs.address_text AS secondary_address_text, cs.updated_at AS secondary_location_updated_at
     FROM users u
     LEFT JOIN client_locations cp ON cp.client_user_id = u.user_id AND cp.location_type = 'PRIMARY'
     LEFT JOIN client_locations cs ON cs.client_user_id = u.user_id AND cs.location_type = 'SECONDARY'
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

export function upsertClientLocation(userId, { locationType, addressText, latitude, longitude }) {
  return query(
    `INSERT INTO client_locations (client_user_id, location_type, address_text, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (client_user_id, location_type)
     DO UPDATE SET address_text = EXCLUDED.address_text,
                   latitude = EXCLUDED.latitude,
                   longitude = EXCLUDED.longitude,
                   updated_at = now()
     RETURNING *`,
    [userId, locationType, addressText, latitude, longitude],
  );
}
