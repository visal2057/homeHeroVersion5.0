import { AppError } from '../../utils/AppError.js';
import { logAction } from '../audit/audit.service.js';
import { sendComplaintReceivedEmail } from '../emails/email.service.js';
import {
  listComplaints,
  listResolvedComplaints,
  findComplaintDetail,
  markComplaintOpened,
  markAcknowledgementSent,
  submitVerdict,
} from './complaint.queries.js';

function toListDto(row) {
  return {
    complaintId: row.complaint_id,
    status: row.complaint_status,
    submittedAt: row.submitted_at,
    resolvedAt: row.resolved_at,
    relatedBookingId: row.related_booking_id,
    complainantName: row.complainant_name,
    complainantToken: row.complainant_token,
    targetName: row.target_name,
    targetToken: row.target_token,
  };
}

function toDetailDto(row) {
  return {
    complaintId: row.complaint_id,
    status: row.complaint_status,
    complaintDetails: row.complaint_details,
    submittedAt: row.submitted_at,
    relatedBookingId: row.related_booking_id,
    openedAt: row.opened_at,
    resolvedAt: row.resolved_at,
    complainant: {
      userId: row.complainant_user_id,
      name: row.complainant_name,
      token: row.complainant_token,
      email: row.complainant_email,
      role: row.complainant_role,
    },
    target: {
      userId: row.target_user_id,
      name: row.target_name,
      token: row.target_token,
      role: row.target_role,
    },
    verdict: row.verdict_text
      ? { investigationNotes: row.investigation_notes, verdictText: row.verdict_text, submittedAt: row.verdict_submitted_at }
      : null,
  };
}

export async function getAllComplaints() {
  const { rows } = await listComplaints();
  return rows.map(toListDto);
}

export async function getComplaintHistory() {
  const { rows } = await listResolvedComplaints();
  return rows.map(toListDto);
}

export async function getComplaintDetail(complaintId, openedByUserId) {
  const { rows: openedRows } = await markComplaintOpened(complaintId, openedByUserId);
  if (openedRows.length > 0) {
    const { rows: detailRows } = await findComplaintDetail(complaintId);
    const detail = detailRows[0];
    await sendComplaintReceivedEmail({ email: detail.complainant_email, full_name: detail.complainant_name }, complaintId);
    await markAcknowledgementSent(complaintId);
    return toDetailDto(detail);
  }

  const { rows } = await findComplaintDetail(complaintId);
  if (rows.length === 0) {
    throw new AppError('Complaint not found', 404);
  }
  return toDetailDto(rows[0]);
}

export async function recordVerdict(complaintId, input, verificationAdminUserId) {
  const finalStatus = input.banRecommendations.length > 0 ? 'BAN_RECOMMENDED' : 'RESOLVED';

  const complaint = await submitVerdict({
    complaintId,
    verificationAdminUserId,
    investigationNotes: input.investigationNotes,
    verdictText: input.verdictText,
    finalStatus,
    banRecommendations: input.banRecommendations,
  });

  await logAction({
    actorUserId: verificationAdminUserId,
    actionCode: 'COMPLAINT_VERDICT_RECORDED',
    entityType: 'complaint',
    entityId: complaintId,
    description: `Verdict recorded for complaint #${complaintId}${input.banRecommendations.length > 0 ? ' with a ban recommendation' : ''}`,
  });

  return toDetailDto({ ...complaint, complainant_name: null });
}
