import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

export default function ApplicationRejectedPage() {
  const location = useLocation();
  const reason = location.state?.reason;

  return (
    <div className="container section text-center">
      <div style={{ fontSize: '3.5rem' }}>✕</div>
      <h1 className="section-title">Application Not Approved</h1>
      <p className="section-subtitle" style={{ maxWidth: 560, margin: '0 auto var(--space-md)' }}>
        Unfortunately your Service Provider application was not approved.
      </p>
      {reason && (
        <p className="card" style={{ display: 'inline-block', padding: 'var(--space-md) var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <strong>Reason:</strong> {reason}
        </p>
      )}
      <p>You may correct the stated issue and apply again.</p>
      <Link to={ROUTES.REGISTER_PROVIDER} className="btn btn-primary">
        Apply Again
      </Link>
    </div>
  );
}
