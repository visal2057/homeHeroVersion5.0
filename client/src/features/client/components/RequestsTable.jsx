import { useState } from 'react';
import { bookingApi } from '../bookingApi.js';

const STATUS_STYLES = {
  PENDING: { bg: '#fffbeb', color: '#d97706', label: '⏳ Pending' },
  ACCEPTED: { bg: '#ecfdf5', color: '#059669', label: '✅ Accepted' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626', label: '✗ Rejected' },
  CANCELLED: { bg: '#f8fafc', color: '#64748b', label: '↩ Cancelled' },
};

export default function RequestsTable({ bookings = [], onRefresh }) {
  const [cancelling, setCancelling] = useState(null);

  async function handleCancel(bookingId) {
    setCancelling(bookingId);
    try {
      await bookingApi.cancelBooking(bookingId);
      onRefresh?.();
    } catch {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  if (!bookings.length) {
    return (
      <div className="bt-empty">
        <span>📨</span>
        <h3>No booking requests yet</h3>
        <p>Explore services and book your first appointment!</p>
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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const status = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
              const canCancel = b.status === 'PENDING' || b.status === 'ACCEPTED';
              return (
                <tr key={b.id}>
                  <td>
                    <div className="bt-provider-cell">
                      <div className="bt-provider-avatar">{(b.providerName ?? 'P')[0]}</div>
                      <span>{b.providerName ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{b.category ?? '—'}</td>
                  <td>
                    {b.scheduledAt
                      ? new Date(b.scheduledAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })
                      : '—'}
                  </td>
                  <td>
                    <span className="bt-status" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 12px', fontSize: 'var(--font-size-xs)' }}
                        disabled={cancelling === b.id}
                        onClick={() => handleCancel(b.id)}
                      >
                        {cancelling === b.id ? '…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TableStyles />
    </div>
  );
}

function TableStyles() {
  return (
    <style>{`
      .bt-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); }
      .bt-empty span { font-size: 2.5rem; display: block; margin-bottom: var(--space-md); }
      .bt-empty h3 { color: var(--color-neutral-600); }
      .bt-table-wrap { overflow-x: auto; }
      .bt-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
      .bt-table th { background: var(--color-neutral-50); padding: 10px 14px; text-align: left; color: var(--color-neutral-600); font-weight: 600; border-bottom: 2px solid var(--color-neutral-200); white-space: nowrap; }
      .bt-table td { padding: 12px 14px; border-bottom: 1px solid var(--color-neutral-100); color: var(--color-neutral-700); vertical-align: middle; }
      .bt-table tr:hover td { background: var(--color-neutral-50); }
      .bt-provider-cell { display: flex; align-items: center; gap: 8px; }
      .bt-provider-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-100); display: flex; align-items: center; justify-content: center; color: var(--color-primary-700); font-weight: 700; flex-shrink: 0; }
      .bt-status { padding: 3px 10px; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; white-space: nowrap; }
    `}</style>
  );
}
