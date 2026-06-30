import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../constants/routes.js';

// Shown when a card payment could not be completed. No money was taken
// and no revenue was recorded, so the client can simply try again.
export default function PaymentFailedPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="result-wrap">
      <div className="result-card">
        <div className="result-icon result-icon-fail">✕</div>
        <h1 className="result-title">Payment failed</h1>
        <p className="result-text">
          We could not complete your payment for booking <strong>#{bookingId}</strong>.
          You have not been charged. Please check your card details and try again.
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
        .result-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-2xl); max-width: 460px; text-align: center; }
        .result-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto var(--space-lg); }
        .result-icon-fail { background: #fef2f2; color: #dc2626; }
        .result-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: var(--space-sm); }
        .result-text { color: var(--color-neutral-600); line-height: 1.6; margin-bottom: var(--space-xl); }
        .result-actions { display: flex; gap: var(--space-sm); justify-content: center; }
      `}</style>
    </div>
  );
}
