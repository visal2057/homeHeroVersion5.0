import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { IconToolbox, IconClock } from '../../../components/common/icons.jsx';

export default function JobsToDoTable({ bookings = [] }) {
  const navigate = useNavigate();

  const goToPayment = (bookingId) =>
    navigate(ROUTES.CLIENT_BOOKING_PAY.replace(':bookingId', bookingId));

  if (!bookings.length) {
    return (
      <div className="bt-empty">
        <IconToolbox size={48} style={{ color: 'var(--color-neutral-300)', marginBottom: 'var(--space-md)' }} />
        <h3>No upcoming jobs</h3>
        <p>Your accepted bookings will appear here.</p>
        <style>{`.bt-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); display: flex; flex-direction: column; align-items: center; } .bt-empty h3 { color: var(--color-neutral-600); margin-bottom: 6px; }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div className="bt-table-wrap">
        <table className="bt-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Provider</th>
              <th>SP Token</th>
              <th>Service</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const scheduledTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
              const isPast = scheduledTime > 0 && Date.now() > scheduledTime;
              return (
                <tr key={b.id}>
                  <td><span className="bt-id">#{b.bookingId ?? b.id}</span></td>
                  <td>
                    <div className="bt-provider-cell">
                      <div className="bt-provider-avatar">{(b.providerName ?? 'P')[0]}</div>
                      <span>{b.providerName ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    {b.providerToken
                      ? <span className="bt-token">{b.providerToken}</span>
                      : <span style={{ color: 'var(--color-neutral-400)' }}>—</span>}
                  </td>
                  <td>{b.category ?? '—'}</td>
                  <td>
                    {b.scheduledAt
                      ? new Date(b.scheduledAt).toLocaleString('en-LK', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td>
                    <span className="bt-status" style={{ background: '#ecfdf5', color: '#059669' }}>Accepted</span>
                  </td>
                  <td>
                    {isPast ? (
                      <button type="button" className="bt-pay-btn" onClick={() => goToPayment(b.id)}>
                        Pay &amp; Review
                      </button>
                    ) : (
                      <span
                        className="bt-pay-btn-disabled"
                        title={b.scheduledAt ? `Available after ${new Date(b.scheduledAt).toLocaleString('en-LK', { dateStyle: 'short', timeStyle: 'short' })}` : 'Awaiting job date'}
                      >
                        <IconClock size={14} style={{ marginRight: 4 }} />
                        Awaiting
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        .bt-table-wrap { overflow-x: auto; }
        .bt-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .bt-table th { background: var(--color-neutral-50); padding: 12px 17px; text-align: left; color: var(--color-neutral-600); font-weight: 600; border-bottom: 2px solid var(--color-neutral-200); white-space: nowrap; }
        .bt-table td { padding: 14px 17px; border-bottom: 1px solid var(--color-neutral-100); color: var(--color-neutral-700); vertical-align: middle; }
        .bt-table tr:hover td { background: var(--color-neutral-50); }
        .bt-provider-cell { display: flex; align-items: center; gap: 10px; }
        .bt-provider-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--color-primary-100); display: flex; align-items: center; justify-content: center; color: var(--color-primary-700); font-weight: 700; flex-shrink: 0; }
        .bt-status { padding: 4px 12px; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; white-space: nowrap; }
        .bt-id { font-family: monospace; font-size: var(--font-size-xs); color: var(--color-neutral-500); }
        .bt-token { font-family: monospace; font-size: var(--font-size-xs); background: var(--color-primary-50); color: var(--color-primary-700); padding: 2px 7px; border-radius: var(--radius-sm); letter-spacing: 0.05em; }
        .bt-pay-btn { padding: 7px 17px; background: var(--color-primary-600); color: white; border: none; border-radius: var(--radius-md); font-size: var(--font-size-xs); font-weight: 600; cursor: pointer; white-space: nowrap; }
        .bt-pay-btn:hover { background: var(--color-primary-700); }
        .bt-pay-btn-disabled { display: inline-flex; align-items: center; padding: 7px 12px; background: var(--color-neutral-100); color: var(--color-neutral-400); border-radius: var(--radius-md); font-size: var(--font-size-xs); font-weight: 600; white-space: nowrap; cursor: default; }
      `}</style>
    </div>
  );
}
