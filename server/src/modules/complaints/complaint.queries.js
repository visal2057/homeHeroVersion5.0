import { query } from '../../db/query.js';
import { pool } from '../../db/pool.js';

export function listComplaints() {
  return query(
    `SELECT c.complaint_id, c.complaint_status, c.submitted_at, c.related_booking_id,
            cu.full_name AS complainant_name, cu.user_token AS complainant_token,
            tu.full_name AS target_name, tu.user_token AS target_token
     FROM complaints c
     JOIN users cu ON cu.user_id = c.complainant_user_id
     JOIN users tu ON tu.user_id = c.target_user_id
     ORDER BY c.submitted_at DESC`,
  );
}

export function findComplaintDetail(complaintId) {
  return query(
    `SELECT c.*,
            cu.user_id AS complainant_user_id, cu.full_name AS complainant_name, cu.user_token AS complainant_token, cu.email AS complainant_email, cr.role_code AS complainant_role,
            tu.user_id AS target_user_id, tu.full_name AS target_name, tu.user_token AS target_token, tr.role_code AS target_role,
            cv.investigation_notes, cv.verdict_text, cv.submitted_at AS verdict_submitted_at
     FROM complaints c
     JOIN users cu ON cu.user_id = c.complainant_user_id
     JOIN roles cr ON cr.role_id = cu.role_id
     JOIN users tu ON tu.user_id = c.target_user_id
     JOIN roles tr ON tr.role_id = tu.role_id
     LEFT JOIN complaint_verdicts cv ON cv.complaint_id = c.complaint_id
     WHERE c.complaint_id = $1`,
    [complaintId],
  );
}

export function markComplaintOpened(complaintId, openedByUserId) {
  return query(
    `UPDATE complaints SET complaint_status = 'UNDER_REVIEW', opened_by_user_id = $1, opened_at = now(), updated_at = now()
     WHERE complaint_id = $2 AND complaint_status = 'SUBMITTED'
     RETURNING *`,
    [openedByUserId, complaintId],
  );
}

export function markAcknowledgementSent(complaintId) {
  return query(`UPDATE complaints SET acknowledgement_email_sent_at = now() WHERE complaint_id = $1`, [complaintId]);
}

export async function submitVerdict({ complaintId, verificationAdminUserId, investigationNotes, verdictText, finalStatus, banRecommendations }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO complaint_verdicts (complaint_id, verification_admin_user_id, investigation_notes, verdict_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (complaint_id) DO UPDATE SET investigation_notes = EXCLUDED.investigation_notes, verdict_text = EXCLUDED.verdict_text, submitted_at = now()`,
      [complaintId, verificationAdminUserId, investigationNotes ?? null, verdictText],
    );

    for (const rec of banRecommendations) {
      await client.query(
        `INSERT INTO ban_requests (complaint_id, requested_user_id, requested_by_user_id, ban_type, requested_ends_at, reason)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [complaintId, rec.userId, verificationAdminUserId, rec.banType, rec.endsAt ?? null, rec.reason],
      );
    }

    const { rows } = await client.query(
      `UPDATE complaints SET complaint_status = $1, resolved_at = CASE WHEN $1 = 'RESOLVED' THEN now() ELSE resolved_at END, updated_at = now()
       WHERE complaint_id = $2
       RETURNING *`,
      [finalStatus, complaintId],
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
