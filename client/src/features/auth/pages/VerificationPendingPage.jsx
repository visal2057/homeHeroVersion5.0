import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

export default function VerificationPendingPage() {
  return (
    <div className="container section text-center">
      <div style={{ fontSize: '3.5rem' }}>⏳</div>
      <h1 className="section-title">Application Received</h1>
      <p className="section-subtitle" style={{ maxWidth: 560, margin: '0 auto var(--space-xl)' }}>
        Thank you for applying to become a HomeHero Service Provider. Your verification is still pending —
        our Verification Admin team is reviewing your documents. You cannot access full Service Provider
        functionality until your application is approved. You will receive an email once a decision has been
        made.
      </p>
      <Link to={ROUTES.HOME} className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
