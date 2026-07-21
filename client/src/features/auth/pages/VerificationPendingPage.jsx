import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { VERIFICATION_PENDING_IMAGE_URL } from '../../../constants/pageImages.js';
import { IconClock } from '../../../components/common/icons.jsx';

export default function VerificationPendingPage() {
  return (
    <div className="register-page">
      <div
        className="register-page-bg"
        style={{ backgroundImage: `url(${VERIFICATION_PENDING_IMAGE_URL})` }}
        role="img"
        aria-label="Hands cradling a young sprout growing in soil"
      />
      <div className="register-page-overlay" aria-hidden="true" />
      <div className="container register-page-inner">
        <div className="register-glass-box register-status-card animate-fade-in-up">
          <div className="register-status-icon" aria-hidden="true">
            <IconClock size={30} />
          </div>
          <h1 className="register-status-title">Application Received</h1>
          <p className="register-status-message">
            Thank you for applying to become a HomeHero Service Provider. Your verification is still pending —
            our Verification Admin team is reviewing your documents. You won&apos;t have access to full Service
            Provider functionality until your application is approved, and you&apos;ll receive an email as soon
            as a decision has been made.
          </p>
          <Link to={ROUTES.HOME} className="btn btn-primary btn-shine register-status-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
