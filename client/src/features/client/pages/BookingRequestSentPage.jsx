import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { IconCheckCircle, IconClipboardList, IconHome } from '../../../components/common/icons.jsx';

export default function BookingRequestSentPage() {
  const { state } = useLocation();
  const bookingId = state?.bookingId;

  return (
    <div className="brs-page">
      <div className="container">
        <div className="brs-card">
          <div className="brs-icon">
            <IconCheckCircle size={77} style={{ color: 'var(--color-primary-600)' }} />
          </div>
          <h1 className="brs-title">Booking Request Sent!</h1>
          <p className="brs-sub">
            Your booking request has been submitted successfully. The provider will review and respond within <strong>24 hours</strong>.
          </p>

          {bookingId && (
            <div className="brs-booking-ref">
              <div className="brs-ref-label">Booking Reference</div>
              <div className="brs-ref-id">#{bookingId}</div>
              <div className="brs-ref-hint">Keep this reference for your records</div>
            </div>
          )}

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
                <div className="brs-step-desc">Service is delivered, then pay and leave a review</div>
              </div>
            </div>
          </div>

          <div className="brs-actions">
            <Link to={ROUTES.CLIENT_MY_BOOKINGS} className="btn btn-primary btn-shine">
              <IconClipboardList size={19} style={{ marginRight: 6 }} />
              View My Bookings
            </Link>
            <Link to={ROUTES.HOME} className="btn btn-outline">
              <IconHome size={19} style={{ marginRight: 6 }} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .brs-page { padding: var(--space-2xl) 0; display: flex; align-items: center; min-height: 60vh; }
        .brs-card {
          max-width: 672px; margin: 0 auto; text-align: center;
          background: white; border-radius: var(--radius-lg); padding: var(--space-2xl);
          border: 1px solid var(--color-neutral-200); box-shadow: var(--shadow-md);
        }
        .brs-icon { display: flex; justify-content: center; margin-bottom: var(--space-lg); }
        .brs-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .brs-sub { color: var(--color-neutral-500); margin-bottom: var(--space-xl); font-size: var(--font-size-lg); line-height: 1.6; }
        .brs-booking-ref {
          background: var(--color-primary-50); border: 1px solid var(--color-primary-200);
          border-radius: var(--radius-md); padding: var(--space-lg);
          margin-bottom: var(--space-xl);
        }
        .brs-ref-label { font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary-600); font-weight: 700; margin-bottom: 4px; }
        .brs-ref-id { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-secondary-700); font-family: monospace; margin-bottom: 4px; }
        .brs-ref-hint { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
        .brs-steps { text-align: left; margin-bottom: var(--space-xl); }
        .brs-step { display: flex; gap: var(--space-md); align-items: flex-start; }
        .brs-step-line { width: 2px; height: 29px; background: var(--color-neutral-200); margin-left: 21px; }
        .brs-step-dot {
          width: 43px; height: 43px; border-radius: 50%;
          background: var(--color-neutral-100); border: 2px solid var(--color-neutral-300);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--font-size-sm); color: var(--color-neutral-500); flex-shrink: 0;
        }
        .brs-step-dot-done { background: var(--color-primary-600); border-color: var(--color-primary-600); color: white; }
        .brs-step-label { font-weight: 600; color: var(--color-secondary-700); margin-bottom: 2px; }
        .brs-step-desc { font-size: var(--font-size-sm); color: var(--color-neutral-500); }
        .brs-step-done .brs-step-label { color: var(--color-primary-700); }
        .brs-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; justify-content: center; align-items: center; }
      `}</style>
    </div>
  );
}
