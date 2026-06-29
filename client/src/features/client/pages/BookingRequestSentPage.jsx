import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

export default function BookingRequestSentPage() {
  return (
    <div className="brs-page">
      <div className="container">
        <div className="brs-card">
          <div className="brs-icon">✅</div>
          <h1 className="brs-title">Booking Request Sent!</h1>
          <p className="brs-sub">
            Your booking request has been submitted successfully. The provider will review and respond within <strong>24 hours</strong>.
          </p>

          <div className="brs-steps">
            <div className="brs-step brs-step-done">
              <div className="brs-step-dot brs-step-dot-done">1</div>
              <div>
                <div className="brs-step-label">Request Sent</div>
                <div className="brs-step-desc">Your booking request is with the provider</div>
              </div>
            </div>
            <div className="brs-step-line" />
            <div className="brs-step">
              <div className="brs-step-dot">2</div>
              <div>
                <div className="brs-step-label">Provider Review</div>
                <div className="brs-step-desc">Provider accepts or declines (within 24h)</div>
              </div>
            </div>
            <div className="brs-step-line" />
            <div className="brs-step">
              <div className="brs-step-dot">3</div>
              <div>
                <div className="brs-step-label">Job Completed</div>
                <div className="brs-step-desc">Service is delivered, leave a review!</div>
              </div>
            </div>
          </div>

          <div className="brs-actions">
            <Link to={ROUTES.CLIENT_MY_BOOKINGS} className="btn btn-primary btn-shine">
              📋 View My Bookings
            </Link>
            <Link to={ROUTES.CLIENT_HOME} className="btn btn-outline">
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .brs-page { padding: var(--space-2xl) 0; display: flex; align-items: center; min-height: 60vh; }
        .brs-card {
          max-width: 560px; margin: 0 auto; text-align: center;
          background: white; border-radius: var(--radius-lg); padding: var(--space-2xl);
          border: 1px solid var(--color-neutral-200); box-shadow: var(--shadow-md);
        }
        .brs-icon { font-size: 4rem; margin-bottom: var(--space-lg); }
        .brs-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .brs-sub { color: var(--color-neutral-500); margin-bottom: var(--space-xl); font-size: var(--font-size-lg); line-height: 1.6; }
        .brs-steps { text-align: left; margin-bottom: var(--space-xl); }
        .brs-step { display: flex; gap: var(--space-md); align-items: flex-start; }
        .brs-step-line { width: 2px; height: 24px; background: var(--color-neutral-200); margin-left: 18px; }
        .brs-step-dot {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--color-neutral-100); border: 2px solid var(--color-neutral-300);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--font-size-sm); color: var(--color-neutral-500);
          flex-shrink: 0;
        }
        .brs-step-dot-done { background: var(--color-primary-600); border-color: var(--color-primary-600); color: white; }
        .brs-step-label { font-weight: 600; color: var(--color-secondary-700); margin-bottom: 2px; }
        .brs-step-desc { font-size: var(--font-size-sm); color: var(--color-neutral-500); }
        .brs-step-done .brs-step-label { color: var(--color-primary-700); }
        .brs-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; justify-content: center; }
      `}</style>
    </div>
  );
}
