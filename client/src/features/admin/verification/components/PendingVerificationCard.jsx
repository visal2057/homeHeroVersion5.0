import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../constants/routes.js';

export default function PendingVerificationCard({ application }) {
  return (
    <div className="card review-card">
      <div className="review-card-row">
        <div>
          <strong>{application.fullName}</strong> <span className="status-badge is-neutral">@{application.username}</span>
          <p className="review-card-meta">Token: {application.userToken}</p>
          <p className="review-card-meta">Categories: {application.categories ?? '—'}</p>
          <p className="review-card-meta">District: {application.districtName}</p>
          <p className="review-card-meta">Applied {new Date(application.submittedAt).toLocaleDateString()}</p>
        </div>
        <Link className="btn btn-primary" to={ROUTES.VERIFICATION_ADMIN_REVIEW.replace(':applicationId', application.applicationId)}>
          Review Documents
        </Link>
      </div>
    </div>
  );
}
