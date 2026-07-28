// Shows the read-only facts about the booking the client is paying for.
// `context` comes from GET /payments/booking/:id (see clientPaymentApi.js).
// There is no price here on purpose: the amount is agreed offline and the
// client enters it on the card form.
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
        <span>Status</span>
        <strong className="ps-status-pill">{context.status}</strong>
      </div>

      <style>{`
        .ps-card {
          background: var(--color-neutral-0); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: var(--space-xl); box-shadow: var(--shadow-sm);
        }
        .ps-title { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .ps-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--color-neutral-100); font-size: var(--font-size-sm); color: var(--color-neutral-600); }
        .ps-row strong { color: var(--color-neutral-800); }
        .ps-row-total { border-bottom: none; padding-top: var(--space-md); font-size: var(--font-size-base); }
        .ps-status-pill {
          display: inline-flex; align-items: center; padding: 3px 12px; border-radius: var(--radius-full);
          background: var(--color-primary-50); color: var(--color-primary-700); font-size: var(--font-size-xs);
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
        }

        @media (max-width: 480px) {
          .ps-card { padding: var(--space-lg); }
          .ps-row { flex-wrap: wrap; gap: 4px; }
        }
      `}</style>
    </div>
  );
}
