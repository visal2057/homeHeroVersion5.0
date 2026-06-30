import { formatLKR } from '../paymentMath.js';

// Shows the read-only facts about the booking the client is paying for.
// `context` comes from GET /payments/booking/:id (see clientPaymentApi.js).
export default function PaymentSummary({ context }) {
  return (
    <div className="ps-card">
      <h2 className="ps-title">Booking summary</h2>

      <div className="ps-row">
        <span>Booking</span>
        <strong>#{context.bookingId}</strong>
      </div>
      <div className="ps-row">
        <span>Service Provider</span>
        <strong>{context.providerName}</strong>
      </div>
      <div className="ps-row">
        <span>Service category</span>
        <strong>{context.categoryName}</strong>
      </div>
      <div className="ps-row ps-row-total">
        <span>Service amount</span>
        <strong>{formatLKR(context.serviceAmount)}</strong>
      </div>

      <style>{`
        .ps-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .ps-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .ps-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--color-neutral-100); font-size: var(--font-size-sm); color: var(--color-neutral-600); }
        .ps-row strong { color: var(--color-neutral-800); }
        .ps-row-total { border-bottom: none; font-size: var(--font-size-base); }
        .ps-row-total strong { color: var(--color-primary-700); }
      `}</style>
    </div>
  );
}
