import { query } from '../../db/query.js';

export function listPendingApplications() {
  return query(
    `SELECT va.verification_application_id, va.provider_user_id, va.submitted_at, va.attempt_number, va.opened_at,
            u.username, u.full_name, u.user_token,
            d.district_name,
            string_agg(DISTINCT sc.category_name, ', ') AS categories
     FROM sp_verification_applications va
     JOIN users u ON u.user_id = va.provider_user_id
     JOIN service_provider_profiles spp ON spp.provider_user_id = va.provider_user_id
     JOIN districts d ON d.district_id = spp.service_district_id
     LEFT JOIN provider_service_categories psc ON psc.provider_user_id = va.provider_user_id
     LEFT JOIN service_categories sc ON sc.service_category_id = psc.service_category_id
     WHERE va.verification_status = 'PENDING'
     GROUP BY va.verification_application_id, va.provider_user_id, va.submitted_at, va.attempt_number, va.opened_at,
              u.username, u.full_name, u.user_token, d.district_name
     ORDER BY va.submitted_at ASC`,
  );
}

// Applications the Verification Admin has already resolved (approved or
// rejected), for the Applications history page (Change 2). Kept as a
// separate query rather than widening listPendingApplications's WHERE
// clause so the dashboard query plan/shape stays untouched.
export function listResolvedApplications(status) {
  return query(
    `SELECT va.verification_application_id, va.provider_user_id, va.submitted_at, va.attempt_number,
            va.verification_status, va.reviewed_at, va.rejection_reason,
            u.username, u.full_name, u.user_token,
            d.district_name,
            string_agg(DISTINCT sc.category_name, ', ') AS categories
     FROM sp_verification_applications va
     JOIN users u ON u.user_id = va.provider_user_id
     JOIN service_provider_profiles spp ON spp.provider_user_id = va.provider_user_id
     JOIN districts d ON d.district_id = spp.service_district_id
     LEFT JOIN provider_service_categories psc ON psc.provider_user_id = va.provider_user_id
     LEFT JOIN service_categories sc ON sc.service_category_id = psc.service_category_id
     WHERE va.verification_status = $1
     GROUP BY va.verification_application_id, va.provider_user_id, va.submitted_at, va.attempt_number,
              va.verification_status, va.reviewed_at, va.rejection_reason,
              u.username, u.full_name, u.user_token, d.district_name
     ORDER BY va.reviewed_at DESC NULLS LAST, va.submitted_at DESC`,
    [status],
  );
}

// "Opening" an application (viewing its documents) is how the dashboard
// tells Unread apart from Processing, the same idea as
// complaint.queries.js's markComplaintOpened. Guarded to PENDING so it's a
// no-op once the application has already been approved/rejected.
export function markApplicationOpened(applicationId, openedByUserId) {
  return query(
    `UPDATE sp_verification_applications
     SET opened_by_user_id = $1, opened_at = now()
     WHERE verification_application_id = $2 AND opened_at IS NULL AND verification_status = 'PENDING'
     RETURNING *`,
    [openedByUserId, applicationId],
  );
}

export function findApplicationDetail(applicationId) {
  return query(
    `SELECT va.*, u.username, u.full_name, u.email, u.phone, u.user_token,
            spp.bio, spp.work_hours_details, spp.hourly_charge_estimate,
            sd.district_name AS service_district_name, hd.district_name AS home_district_name
     FROM sp_verification_applications va
     JOIN users u ON u.user_id = va.provider_user_id
     JOIN service_provider_profiles spp ON spp.provider_user_id = va.provider_user_id
     JOIN districts sd ON sd.district_id = spp.service_district_id
     JOIN districts hd ON hd.district_id = spp.home_district_id
     WHERE va.verification_application_id = $1`,
    [applicationId],
  );
}

export function findApplicationCategories(providerUserId) {
  return query(
    `SELECT sc.category_name FROM provider_service_categories psc
     JOIN service_categories sc ON sc.service_category_id = psc.service_category_id
     WHERE psc.provider_user_id = $1`,
    [providerUserId],
  );
}

export function findApplicationDocuments(applicationId) {
  return query(
    `SELECT * FROM sp_verification_documents WHERE verification_application_id = $1 ORDER BY document_type`,
    [applicationId],
  );
}

export function findDocumentById(documentId) {
  return query(`SELECT * FROM sp_verification_documents WHERE verification_document_id = $1`, [documentId]);
}

export function approveApplicationRow(applicationId, providerUserId, reviewerId) {
  return query(
    `WITH app AS (
       UPDATE sp_verification_applications
       SET verification_status = 'APPROVED', reviewed_by_user_id = $1, reviewed_at = now()
       WHERE verification_application_id = $2
       RETURNING provider_user_id
     )
     UPDATE service_provider_profiles
     SET verification_status = 'APPROVED', verified_at = now(), updated_at = now()
     WHERE provider_user_id = $3
     RETURNING *`,
    [reviewerId, applicationId, providerUserId],
  );
}

export function rejectApplicationRow(applicationId, providerUserId, reviewerId, reason) {
  return query(
    `WITH app AS (
       UPDATE sp_verification_applications
       SET verification_status = 'REJECTED', reviewed_by_user_id = $1, reviewed_at = now(), rejection_reason = $2
       WHERE verification_application_id = $3
       RETURNING provider_user_id
     )
     UPDATE service_provider_profiles
     SET verification_status = 'REJECTED', updated_at = now()
     WHERE provider_user_id = $4
     RETURNING *`,
    [reviewerId, reason, applicationId, providerUserId],
  );
}
