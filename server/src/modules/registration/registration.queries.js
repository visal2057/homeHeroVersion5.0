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

export function insertVerificationApplication(client, { providerUserId, policeStationName, policeReportDate, termsVersion }) {
  return client.query(
    `INSERT INTO sp_verification_applications
       (provider_user_id, attempt_number, police_station_name, police_report_date, terms_version, terms_accepted_at)
     VALUES ($1, 1, $2, $3, $4, now())
     RETURNING *`,
    [providerUserId, policeStationName, policeReportDate, termsVersion],
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
