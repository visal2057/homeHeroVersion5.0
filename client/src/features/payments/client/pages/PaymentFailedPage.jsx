import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../constants/routes.js';
import { IconXCircle } from '../../../../components/common/icons.jsx';

export default function PaymentFailedPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="result-wrap">
      <div className="result-card">
        <div className="result-icon-wrap result-icon-fail">
          <IconXCircle size={36} style={{ color: '#dc2626' }} />
        </div>
        <h1 className="result-title">Payment failed</h1>
        <p className="result-text">
          We could not complete your payment for booking <strong style={{ fontFamily: 'monospace' }}>#{bookingId}</strong>.
          You have not been charged. Please check your details and try again.
        </p>
        <div className="result-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(ROUTES.CLIENT_MY_BOOKINGS)}
          >
            My bookings
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(ROUTES.CLIENT_BOOKING_PAY.replace(':bookingId', bookingId))}
          >
            Try again
          </button>
        </div>
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
        .result-icon-fail { background: #fef2f2; }
        .result-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: var(--space-sm); font-weight: 800; }
        .result-text { color: var(--color-neutral-600); line-height: 1.6; margin-bottom: var(--space-xl); }
        .result-actions { display: flex; gap: var(--space-sm); justify-content: center; }

        @media (max-width: 480px) {
          .result-wrap { padding: var(--space-xl) var(--space-sm); }
          .result-card { padding: var(--space-lg) var(--space-md); }
          .result-actions { flex-direction: column-reverse; }
          .result-actions .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
