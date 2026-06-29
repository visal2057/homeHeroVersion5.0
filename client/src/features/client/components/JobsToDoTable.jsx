export default function JobsToDoTable({ bookings = [] }) {
  if (!bookings.length) {
    return (
      <div className="bt-empty">
        <span>🔨</span>
        <h3>No upcoming jobs</h3>
        <p>Your approved bookings will appear here.</p>
        <style>{`.bt-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); } .bt-empty span { font-size: 2.5rem; display: block; margin-bottom: var(--space-md); } .bt-empty h3 { color: var(--color-neutral-600); }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div className="bt-table-wrap">
        <table className="bt-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <div className="bt-provider-cell">
                    <div className="bt-provider-avatar">{(b.providerName ?? 'P')[0]}</div>
                    <span>{b.providerName ?? 'Unknown'}</span>
                  </div>
                </td>
                <td>{b.category ?? '—'}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-LK', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>{b.startTime ?? ''}</div>
                </td>
                <td>{b.durationHours ? `${b.durationHours}h` : '—'}</td>
                <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-600)' }}>
                  {[b.addressLine1, b.addressLine2, b.district].filter(Boolean).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        .bt-table-wrap { overflow-x: auto; }
        .bt-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .bt-table th { background: var(--color-neutral-50); padding: 10px 14px; text-align: left; color: var(--color-neutral-600); font-weight: 600; border-bottom: 2px solid var(--color-neutral-200); white-space: nowrap; }
        .bt-table td { padding: 12px 14px; border-bottom: 1px solid var(--color-neutral-100); color: var(--color-neutral-700); vertical-align: middle; }
        .bt-table tr:hover td { background: var(--color-neutral-50); }
        .bt-provider-cell { display: flex; align-items: center; gap: 8px; }
        .bt-provider-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-100); display: flex; align-items: center; justify-content: center; color: var(--color-primary-700); font-weight: 700; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
