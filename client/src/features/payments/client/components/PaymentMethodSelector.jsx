// Lets the client choose how they want to pay.
// `value` is the currently chosen method ('CASH' or 'CARD').
// `onChange` is called with the new method when a card is clicked.
export default function PaymentMethodSelector({ value, onChange }) {
  // The two options we render. Keeping them in an array means the JSX
  // below stays short and both cards look identical.
  const options = [
    { key: 'CASH', icon: '💵', title: 'Cash', subtitle: 'Pay the provider directly. No platform fee.' },
    { key: 'CARD', icon: '💳', title: 'Card', subtitle: 'Pay online. A 5% platform fee applies.' },
  ];

  return (
    <div className="pm-wrap">
      <h2 className="pm-title">Choose a payment method</h2>

      <div className="pm-options">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`pm-option ${value === opt.key ? 'pm-option-active' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <span className="pm-icon">{opt.icon}</span>
            <span className="pm-text">
              <strong>{opt.title}</strong>
              <small>{opt.subtitle}</small>
            </span>
            <span className="pm-radio">{value === opt.key ? '●' : ''}</span>
          </button>
        ))}
      </div>

      <style>{`
        .pm-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .pm-options { display: flex; flex-direction: column; gap: var(--space-md); }
        .pm-option { display: flex; align-items: center; gap: var(--space-md); width: 100%; text-align: left; padding: var(--space-md) var(--space-lg); background: white; border: 2px solid var(--color-neutral-200); border-radius: var(--radius-lg); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .pm-option:hover { border-color: var(--color-primary-300); }
        .pm-option-active { border-color: var(--color-primary-500); background: var(--color-primary-50); }
        .pm-icon { font-size: 1.6rem; }
        .pm-text { display: flex; flex-direction: column; flex: 1; }
        .pm-text strong { color: var(--color-neutral-800); }
        .pm-text small { color: var(--color-neutral-500); font-size: var(--font-size-xs); }
        .pm-radio { color: var(--color-primary-600); font-size: 1.1rem; width: 16px; }
      `}</style>
    </div>
  );
}
