import { IconDollarSign, IconCreditCard, IconCheck } from '../../../../components/common/icons.jsx';

// Lets the client choose how they want to pay.
// `value` is the currently chosen method ('CASH' or 'CARD').
// `onChange` is called with the new method when a card is clicked.
export default function PaymentMethodSelector({ value, onChange }) {
  // The two options we render. Keeping them in an array means the JSX
  // below stays short and both cards look identical.
  const options = [
    { key: 'CASH', Icon: IconDollarSign, tone: 'green', title: 'Cash', subtitle: 'Pay the provider directly. No platform fee.' },
    { key: 'CARD', Icon: IconCreditCard, tone: 'blue', title: 'Card', subtitle: 'Pay online. A 5% platform fee applies.' },
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
            <span className={`pm-icon pm-icon-${opt.tone}`}>
              <opt.Icon size={22} />
            </span>
            <span className="pm-text">
              <strong>{opt.title}</strong>
              <small>{opt.subtitle}</small>
            </span>
            <span className={`pm-radio ${value === opt.key ? 'pm-radio-on' : ''}`}>
              {value === opt.key && <IconCheck size={13} />}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .pm-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); font-weight: 700; margin-bottom: var(--space-md); }
        .pm-options { display: flex; flex-direction: column; gap: var(--space-md); }
        .pm-option {
          display: flex; align-items: center; gap: var(--space-md); width: 100%; text-align: left;
          padding: var(--space-md) var(--space-lg); background: var(--color-neutral-0);
          border: 2px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: border-color var(--transition-base), background var(--transition-base),
            box-shadow var(--transition-base), transform var(--transition-base);
        }
        .pm-option:hover { border-color: var(--color-primary-300); box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .pm-option-active { border-color: var(--color-primary-500); background: var(--color-primary-50); box-shadow: var(--shadow-md); }
        .pm-icon {
          width: 46px; height: 46px; border-radius: var(--radius-md); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .pm-icon-green { background: var(--color-primary-50); color: var(--color-primary-700); }
        .pm-icon-blue { background: var(--color-info-bg); color: var(--color-info); }
        .pm-text { display: flex; flex-direction: column; flex: 1; gap: 2px; }
        .pm-text strong { color: var(--color-neutral-800); font-size: var(--font-size-base); }
        .pm-text small { color: var(--color-neutral-500); font-size: var(--font-size-xs); }
        .pm-radio {
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid var(--color-neutral-300); color: var(--color-neutral-0);
          display: flex; align-items: center; justify-content: center;
          transition: background-color var(--transition-base), border-color var(--transition-base);
        }
        .pm-radio-on { background: var(--color-primary-600); border-color: var(--color-primary-600); }
      `}</style>
    </div>
  );
}
