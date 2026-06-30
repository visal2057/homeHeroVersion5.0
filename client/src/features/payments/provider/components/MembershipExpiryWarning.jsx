// A red/amber banner that appears only when the membership has expired or is
// in its grace period, telling the provider to renew before they are forced
// offline. Returns nothing (renders nothing) when the membership is healthy.
export default function MembershipExpiryWarning({ current }) {
  if (!current) return null;

  const expired = current.status === 'EXPIRED';
  const inGrace = current.isInGracePeriod;
  if (!expired && !inGrace) return null;

  // Whole days left until the grace period ends (never negative).
  const daysLeft = current.graceEndsAt
    ? Math.max(0, Math.ceil((new Date(current.graceEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const stillInGrace = daysLeft > 0;

  return (
    <div className={`mw ${stillInGrace ? 'mw-warn' : 'mw-danger'}`}>
      <span className="mw-icon">⚠️</span>
      <div>
        {stillInGrace ? (
          <>
            <strong>Your membership has expired.</strong> You have{' '}
            <strong>{daysLeft} day{daysLeft > 1 ? 's' : ''}</strong> of grace left. Renew now to keep
            receiving bookings.
          </>
        ) : (
          <>
            <strong>Your membership and grace period have ended.</strong> You are offline and cannot
            receive new bookings until you renew.
          </>
        )}
      </div>

      <style>{`
        .mw { display: flex; gap: var(--space-sm); align-items: flex-start; padding: var(--space-md) var(--space-lg); border-radius: var(--radius-md); font-size: var(--font-size-sm); line-height: 1.5; }
        .mw-warn { background: #fffbeb; color: #92400e; border: 1px solid #fcd34d; }
        .mw-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
        .mw-icon { font-size: 1.1rem; }
      `}</style>
    </div>
  );
}
