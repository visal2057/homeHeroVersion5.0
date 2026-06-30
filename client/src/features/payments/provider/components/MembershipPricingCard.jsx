import { formatLKR } from '../../client/paymentMath.js';

// Shows the price of the provider's NEXT payment and a button to pay.
// `quote` comes from the backend (it decides first-payment vs renewal price).
// `onBuy` opens the payment form; `hasActive` switches the wording to "Renew".
// `canBuy` is false while a membership is still active - renewal is only
// allowed once it expires, so we show a note instead of the button.
export default function MembershipPricingCard({ quote, hasActive, canBuy = true, activeUntil, onBuy }) {
  const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  if (!quote) {
    return (
      <div className="mp-card">
        <h3 className="mp-title">Membership price</h3>
        <p className="mp-note">Select a service category first to see your membership price.</p>
        <style>{`.mp-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); } .mp-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-sm); } .mp-note { color: var(--color-neutral-500); }`}</style>
      </div>
    );
  }

  return (
    <div className="mp-card">
      <h3 className="mp-title">{hasActive ? 'Renew membership' : 'Buy membership'}</h3>

      <div className="mp-price">{formatLKR(quote.amount)}<small>/ {quote.durationMonths} month</small></div>
      <p className="mp-meta">
        Covers your <strong>{quote.categoryCount}</strong> {quote.categoryCount > 1 ? 'categories' : 'category'} ·{' '}
        {quote.isFirstPayment ? 'first payment' : 'renewal rate'} · {quote.graceDays}-day grace period
      </p>

      {canBuy ? (
        <button type="button" className="btn btn-primary mp-btn" onClick={onBuy}>
          {hasActive ? 'Renew now' : 'Buy membership'}
        </button>
      ) : (
        <p className="mp-locked">
          Your membership is active until <strong>{day(activeUntil)}</strong>. You can renew once it expires.
        </p>
      )}

      <style>{`
        .mp-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .mp-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .mp-price { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-primary-700); }
        .mp-price small { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-neutral-500); margin-left: 6px; }
        .mp-meta { color: var(--color-neutral-600); font-size: var(--font-size-sm); margin: var(--space-sm) 0 var(--space-lg); }
        .mp-btn { width: 100%; }
        .mp-locked { font-size: var(--font-size-sm); color: var(--color-neutral-600); background: var(--color-neutral-50); border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); padding: var(--space-md); }
      `}</style>
    </div>
  );
}
