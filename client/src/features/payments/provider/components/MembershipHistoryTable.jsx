import { formatLKR } from '../../client/paymentMath.js';

// A simple table of the provider's past membership payments, newest first.
export default function MembershipHistoryTable({ history = [] }) {
  const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

  if (history.length === 0) {
    return (
      <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
        No membership payments yet.
      </p>
    );
  }

  return (
    <div className="mh-wrap">
      <table className="mh-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Card</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.membershipId}>
              <td>{day(h.paidAt ?? h.startsAt)}</td>
              <td>{h.paymentType === 'FIRST_PAYMENT' ? 'First payment' : 'Renewal'}</td>
              <td>{formatLKR(h.amount)}</td>
              <td>{h.cardLastFour ? `•••• ${h.cardLastFour}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .mh-wrap { overflow-x: auto; }
        .mh-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .mh-table th { text-align: left; padding: 10px 14px; background: var(--color-neutral-50); color: var(--color-neutral-600); font-weight: 600; border-bottom: 2px solid var(--color-neutral-200); }
        .mh-table td { padding: 10px 14px; border-bottom: 1px solid var(--color-neutral-100); color: var(--color-neutral-700); }
      `}</style>
    </div>
  );
}
