import fs from 'fs';
import { AppError } from '../../utils/AppError.js';
import { logAction } from '../audit/audit.service.js';
import { sendVerificationApprovedEmail, sendVerificationRejectedEmail } from '../emails/email.service.js';
import {
  listPendingApplications,
  listResolvedApplications,
  markApplicationOpened,
  findApplicationDetail,
  findApplicationCategories,
  findApplicationDocuments,
  findDocumentById,
  approveApplicationRow,
  rejectApplicationRow,
} from './verification.queries.js';

export async function getPendingApplications() {
  const { rows } = await listPendingApplications();
  return rows.map((row) => ({
    applicationId: row.verification_application_id,
    providerUserId: row.provider_user_id,
    username: row.username,
    fullName: row.full_name,
    userToken: row.user_token,
    districtName: row.district_name,
    categories: row.categories,
    submittedAt: row.submitted_at,
    attemptNumber: row.attempt_number,
    openedAt: row.opened_at,
  }));
}

function toHistoryDto(row) {
  return {
    applicationId: row.verification_application_id,
    providerUserId: row.provider_user_id,
    username: row.username,
    fullName: row.full_name,
    userToken: row.user_token,
    districtName: row.district_name,
    categories: row.categories,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    verificationStatus: row.verification_status,
    rejectionReason: row.rejection_reason,
    attemptNumber: row.attempt_number,
  };
}

// Applications page (Change 2): approved and rejected applications for
// later reference, split into the two tabs the page renders.
export async function getApplicationHistory() {
  const [{ rows: approvedRows }, { rows: rejectedRows }] = await Promise.all([
    listResolvedApplications('APPROVED'),
    listResolvedApplications('REJECTED'),
  ]);
  return {
    approved: approvedRows.map(toHistoryDto),
    rejected: rejectedRows.map(toHistoryDto),
  };
}

export async function getApplicationDetail(applicationId) {
  const { rows } = await findApplicationDetail(applicationId);
  if (rows.length === 0) {
    throw new AppError('Verification application not found', 404);
  }
  const row = rows[0];

  const [{ rows: categoryRows }, { rows: documentRows }] = await Promise.all([
    findApplicationCategories(row.provider_user_id),
    findApplicationDocuments(applicationId),
  ]);

  return {
    applicationId: row.verification_application_id,
    providerUserId: row.provider_user_id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    userToken: row.user_token,
    bio: row.bio,
    workHoursDetails: row.work_hours_details,
    hourlyChargeEstimate: row.hourly_charge_estimate,
    serviceDistrictName: row.service_district_name,
    homeDistrictName: row.home_district_name,
    categories: categoryRows.map((c) => c.category_name),
    policeStationName: row.police_station_name,
    policeReportDate: row.police_report_date,
    verificationStatus: row.verification_status,
    submittedAt: row.submitted_at,
    openedAt: row.opened_at,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    documents: documentRows.map((doc) => ({
      documentId: doc.verification_document_id,
      documentType: doc.document_type,
      originalFilename: doc.original_filename,
      mimeType: doc.mime_type,
    })),
  };
}

// Used only by the "Review Documents" viewing action (the GET the
// VerificationReviewPage makes when the admin opens an application) so
// merely viewing an application's documents flips it from Unread to
// Processing, mirroring complaint.service.js's getComplaintDetail. The
// plain getApplicationDetail above stays side-effect-free for internal
// reuse (approve/reject email lookup, Applications history popup).
export async function getApplicationDetailForReview(applicationId, viewerUserId) {
  await markApplicationOpened(applicationId, viewerUserId);
  return getApplicationDetail(applicationId);
}

export async function getDocumentFile(documentId) {
  const { rows } = await findDocumentById(documentId);
  if (rows.length === 0) {
    throw new AppError('Document not found', 404);
  }
  const doc = rows[0];
  if (!fs.existsSync(doc.storage_path)) {
    throw new AppError('Document file is missing from storage', 404);
  }
  return doc;
}

export async function approveApplication(applicationId, reviewerId) {
  const detail = await getApplicationDetail(applicationId);

  const { rows } = await approveApplicationRow(applicationId, detail.providerUserId, reviewerId);
  if (rows.length === 0) {
    throw new AppError('Verification application not found', 404);
  }

  await sendVerificationApprovedEmail({ email: detail.email, full_name: detail.fullName });

  await logAction({
    actorUserId: reviewerId,
    actionCode: 'PROVIDER_APPROVED',
    entityType: 'sp_verification_application',
    entityId: applicationId,
    description: `${detail.fullName} was approved as a verified Service Provider`,
  });

  return getApplicationDetail(applicationId);
}

export async function rejectApplication(applicationId, reviewerId, reason) {
  const detail = await getApplicationDetail(applicationId);

  const { rows } = await rejectApplicationRow(applicationId, detail.providerUserId, reviewerId, reason);
  if (rows.length === 0) {
    throw new AppError('Verification application not found', 404);
  }

  await sendVerificationRejectedEmail({ email: detail.email, full_name: detail.fullName }, reason);

  await logAction({
    actorUserId: reviewerId,
    actionCode: 'PROVIDER_REJECTED',
    entityType: 'sp_verification_application',
    entityId: applicationId,
    description: `${detail.fullName}'s Service Provider application was rejected`,
    metadata: { reason },
  });

  return getApplicationDetail(applicationId);
}
