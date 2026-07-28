import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../constants/routes.js';
import { IconCheckCircle } from '../../../../components/common/icons.jsx';

export default function PaymentSuccessPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="result-wrap">
      <div className="result-card">
        <div className="result-icon-wrap result-icon-ok">
          <IconCheckCircle size={36} style={{ color: '#059669' }} />
        </div>
        <h1 className="result-title">All done!</h1>
        <p className="result-text">
          Your payment for booking <strong style={{ fontFamily: 'monospace' }}>#{bookingId}</strong> is recorded
          and your review has been submitted. The booking is now marked as completed.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(ROUTES.CLIENT_MY_BOOKINGS)}
        >
          Back to my bookings
        </button>
      </div>

      <style>{`
        .result-wrap { display: flex; justify-content: center; padding: var(--space-2xl) var(--space-md); }
        .result-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg); padding: var(--space-2xl);
          max-width: 460px; text-align: center; width: 100%;
        }
        .result-icon-wrap {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto var(--space-lg);
        }
        .result-icon-ok { background: #ecfdf5; }
        .result-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: var(--space-sm); font-weight: 800; }
        .result-text { color: var(--color-neutral-600); line-height: 1.6; margin-bottom: var(--space-xl); }

        @media (max-width: 480px) {
          .result-wrap { padding: var(--space-xl) var(--space-sm); }
          .result-card { padding: var(--space-lg) var(--space-md); }
          .result-card > .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
