import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../constants/routes.js';

const STATUS_VARIANT = {
  SUBMITTED: 'is-warning',
  UNDER_REVIEW: 'is-info',
  RESOLVED: 'is-success',
  BAN_RECOMMENDED: 'is-error',
  CLOSED: 'is-neutral',
};

// User-facing labels for the Unread -> Processing -> Resolved lifecycle
// (the dashboard only ever shows SUBMITTED/UNDER_REVIEW complaints; the
// other three statuses only appear on the Complaints history page).
const STATUS_LABEL = {
  SUBMITTED: 'Unread',
  UNDER_REVIEW: 'Processing',
  RESOLVED: 'Resolved',
  BAN_RECOMMENDED: 'Ban Recommended',
  CLOSED: 'Closed',
};

export default function ComplaintCard({ complaint }) {
  return (
    <div className="card review-card">
      <div className="review-card-row">
        <div>
          <strong>Complaint #{complaint.complaintId}</strong>{' '}
          <span className={`status-badge ${STATUS_VARIANT[complaint.status] ?? 'is-neutral'}`}>
            {STATUS_LABEL[complaint.status] ?? complaint.status.replace('_', ' ')}
          </span>
          <p className="review-card-meta">
            {complaint.complainantName} ({complaint.complainantToken}) vs {complaint.targetName} ({complaint.targetToken})
          </p>
          <p className="review-card-meta">Submitted {new Date(complaint.submittedAt).toLocaleString()}</p>
        </div>
        <Link className="btn btn-primary" to={ROUTES.VERIFICATION_ADMIN_COMPLAINT.replace(':complaintId', complaint.complaintId)}>
          View Detail
        </Link>
      </div>
    </div>
  );
}
