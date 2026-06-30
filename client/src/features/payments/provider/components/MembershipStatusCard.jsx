// Shows the provider's current membership: its status and key dates.
// `current` is null when the provider has never bought a membership.
export default function MembershipStatusCard({ current }) {
  // Turn an ISO date into a short readable date, e.g. "8 Jul 2026".
  const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

  // Each status gets its own colour so it reads at a glance.
  const styleFor = {
    ACTIVE: { bg: '#ecfdf5', color: '#059669', label: 'Active' },
    EXPIRED: { bg: '#fef2f2', color: '#dc2626', label: 'Expired' },
    PENDING_PAYMENT: { bg: '#fffbeb', color: '#d97706', label: 'Pending payment' },
    CANCELLED: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
  };

  if (!current) {
    return (
      <div className="ms-card">
        <h3 className="ms-title">Membership</h3>
        <p className="ms-none">You don't have a membership yet. Buy one below to start receiving bookings.</p>
        <style>{`.ms-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); } .ms-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-sm); } .ms-none { color: var(--color-neutral-500); }`}</style>
      </div>
    );
  }

  const badge = styleFor[current.status] ?? styleFor.CANCELLED;

  return (
    <div className="ms-card">
      <div className="ms-head">
        <h3 className="ms-title">Membership</h3>
        <span className="ms-badge" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
      </div>

      <div className="ms-row"><span>Categories covered</span><strong>{current.categoryCount}</strong></div>
      <div className="ms-row"><span>Started</span><strong>{day(current.startsAt)}</strong></div>
      <div className="ms-row"><span>Expires</span><strong>{day(current.expiresAt)}</strong></div>
      <div className="ms-row"><span>Grace period ends</span><strong>{day(current.graceEndsAt)}</strong></div>

      <style>{`
        .ms-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .ms-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); }
        .ms-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); }
        .ms-badge { padding: 4px 12px; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 700; }
        .ms-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-neutral-100); font-size: var(--font-size-sm); color: var(--color-neutral-600); }
        .ms-row strong { color: var(--color-neutral-800); }
      `}</style>
    </div>
  );
}
