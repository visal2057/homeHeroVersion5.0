import { query } from '../../db/query.js';

export function listDistricts() {
  return query(`SELECT district_id, district_name FROM districts WHERE is_active = true ORDER BY district_name`);
}

export function listServiceCategories() {
  return query(
    `SELECT service_category_id, category_code, category_name, description, icon_key
     FROM service_categories WHERE is_active = true ORDER BY category_name`,
  );
}

export function insertProviderProfile(client, { userId, homeDistrictId, serviceDistrictId, bio, workHoursDetails, hourlyChargeEstimate }) {
  return client.query(
    `INSERT INTO service_provider_profiles
       (provider_user_id, home_district_id, service_district_id, bio, work_hours_details, hourly_charge_estimate)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, homeDistrictId, serviceDistrictId, bio, workHoursDetails, hourlyChargeEstimate],
  );
}

export function insertProviderCategory(client, userId, serviceCategoryId) {
  return client.query(
    `INSERT INTO provider_service_categories (provider_user_id, service_category_id) VALUES ($1, $2)`,
    [userId, serviceCategoryId],
  );
}

// A reapplication (see reapplyAsProvider in registration.service.js) replaces
// the previous category selection wholesale rather than diffing it, since the
// applicant resubmits the whole form each time.
export function deleteProviderCategories(client, userId) {
  return client.query(`DELETE FROM provider_service_categories WHERE provider_user_id = $1`, [userId]);
}

export function insertVerificationApplication(client, { providerUserId, attemptNumber, policeStationName, policeReportDate, termsVersion }) {
  return client.query(
    `INSERT INTO sp_verification_applications
       (provider_user_id, attempt_number, police_station_name, police_report_date, terms_version, terms_accepted_at)
     VALUES ($1, $2, $3, $4, $5, now())
     RETURNING *`,
    [providerUserId, attemptNumber, policeStationName, policeReportDate, termsVersion],
  );
}

// Used to work out the next attempt_number for a rejected provider who is
// reapplying, and to enforce the 3-attempt cap.
export function countVerificationApplications(providerUserId) {
  return query(`SELECT COUNT(*)::int AS count FROM sp_verification_applications WHERE provider_user_id = $1`, [providerUserId]);
}

// Resets an existing (previously rejected) provider back to PENDING with
// the freshly submitted profile details, instead of inserting a brand-new
// service_provider_profiles row (that table's PK is provider_user_id, so a
// reapplication must UPDATE the row it already owns).
export function updateProviderProfileForReapplication(client, { userId, homeDistrictId, serviceDistrictId, bio, workHoursDetails, hourlyChargeEstimate }) {
  return client.query(
    `UPDATE service_provider_profiles
     SET home_district_id = $1, service_district_id = $2, bio = $3, work_hours_details = $4, hourly_charge_estimate = $5,
         verification_status = 'PENDING', verified_at = NULL, updated_at = now()
     WHERE provider_user_id = $6`,
    [homeDistrictId, serviceDistrictId, bio, workHoursDetails, hourlyChargeEstimate, userId],
  );
}

export function updateUserForReapplication(client, { userId, fullName, phone }) {
  return client.query(
    `UPDATE users SET full_name = $1, phone = $2, updated_at = now() WHERE user_id = $3`,
    [fullName, phone, userId],
  );
}

export function insertVerificationDocument(client, { applicationId, documentType, storagePath, originalFilename, mimeType, fileSizeBytes }) {
  return client.query(
    `INSERT INTO sp_verification_documents
       (verification_application_id, document_type, storage_path, original_filename, mime_type, file_size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [applicationId, documentType, storagePath, originalFilename, mimeType, fileSizeBytes],
  );
}
