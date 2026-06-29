/* SVG donut chart showing accepted vs rejected vs pending booking requests */
export default function AcceptancePieChart({ accepted = 0, rejected = 0, pending = 0 }) {
  const total = accepted + rejected + pending || 1;
  const acceptedPct = (accepted / total) * 100;
  const rejectedPct = (rejected / total) * 100;
  const pendingPct  = (pending  / total) * 100;

  const R = 54;
  const circumference = 2 * Math.PI * R;

  function arc(pct, offset) {
    return {
      strokeDasharray: `${(pct / 100) * circumference} ${circumference}`,
      strokeDashoffset: -((offset / 100) * circumference),
    };
  }

  const acceptedArc = arc(acceptedPct, 0);
  const rejectedArc = arc(rejectedPct, acceptedPct);
  const pendingArc  = arc(pendingPct,  acceptedPct + rejectedPct);

  return (
    <div className="provider-chart-wrap">
      <div className="provider-chart-donut" aria-label="Booking acceptance chart">
        <svg viewBox="0 0 120 120" width="160" height="160">
          <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-neutral-100)" strokeWidth="16" />
          {accepted > 0 && (
            <circle
              cx="60" cy="60" r={R} fill="none"
              stroke="var(--color-primary-500)" strokeWidth="16"
              strokeLinecap="butt"
              style={acceptedArc}
              transform="rotate(-90 60 60)"
            />
          )}
          {rejected > 0 && (
            <circle
              cx="60" cy="60" r={R} fill="none"
              stroke="var(--color-error)" strokeWidth="16"
              strokeLinecap="butt"
              style={rejectedArc}
              transform="rotate(-90 60 60)"
            />
          )}
          {pending > 0 && (
            <circle
              cx="60" cy="60" r={R} fill="none"
              stroke="var(--color-warning)" strokeWidth="16"
              strokeLinecap="butt"
              style={pendingArc}
              transform="rotate(-90 60 60)"
            />
          )}
          <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--color-secondary-700)">
            {total}
          </text>
          <text x="60" y="70" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">
            total
          </text>
        </svg>
      </div>

      <div className="provider-chart-legend">
        <div className="provider-chart-legend-item">
          <span className="provider-chart-legend-dot" style={{ background: 'var(--color-primary-500)' }} />
          Accepted ({accepted})
        </div>
        <div className="provider-chart-legend-item">
          <span className="provider-chart-legend-dot" style={{ background: 'var(--color-error)' }} />
          Rejected ({rejected})
        </div>
        <div className="provider-chart-legend-item">
          <span className="provider-chart-legend-dot" style={{ background: 'var(--color-warning)' }} />
          Pending ({pending})
        </div>
      </div>
    </div>
  );
}
