import { useState } from 'react';
import { IconCheckCircle } from '../../../components/common/icons.jsx';
import { bookingApi } from '../bookingApi.js';

function InvoiceCell({ bookingId, hasInvoice }) {
  const [downloading, setDownloading] = useState(false);

  if (!hasInvoice) {
    return <span style={{ color: 'var(--color-neutral-400)' }}>—</span>;
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await bookingApi.downloadInvoice(bookingId);
    } catch {
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button type="button" className="bt-invoice-btn" onClick={handleDownload} disabled={downloading}>
      {downloading ? 'Downloading…' : 'Download Invoice'}
    </button>
  );
}

export default function CompletedJobsTable({ bookings = [] }) {
  if (!bookings.length) {
    return (
      <div className="bt-empty">
        <IconCheckCircle size={48} style={{ color: 'var(--color-neutral-300)', marginBottom: 'var(--space-md)' }} />
        <h3>No completed jobs yet</h3>
        <p>Your finished bookings will appear here.</p>
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
              <th>Completed On</th>
              <th>Payment</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
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
                <td>{b.completedAt ? new Date(b.completedAt).toLocaleDateString('en-LK') : '—'}</td>
                <td>
                  {b.paymentMethod ? (
                    <span className="bt-payment-chip">{b.paymentMethod}</span>
                  ) : '—'}
                </td>
                <td>
                  <InvoiceCell bookingId={b.bookingId ?? b.id} hasInvoice={Boolean(b.hasInvoice)} />
                </td>
              </tr>
            ))}
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
        .bt-id { font-family: monospace; font-size: var(--font-size-xs); color: var(--color-neutral-500); }
        .bt-token { font-family: monospace; font-size: var(--font-size-xs); background: var(--color-primary-50); color: var(--color-primary-700); padding: 2px 7px; border-radius: var(--radius-sm); letter-spacing: 0.05em; }
        .bt-payment-chip { padding: 4px 12px; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; background: var(--color-secondary-50, #f0fdf4); color: var(--color-secondary-700); }
        .bt-invoice-btn { padding: 7px 17px; background: var(--color-primary-600); color: white; border: none; border-radius: var(--radius-md); font-size: var(--font-size-xs); font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit; }
        .bt-invoice-btn:hover:not(:disabled) { background: var(--color-primary-700); }
        .bt-invoice-btn:disabled { background: var(--color-neutral-300); cursor: not-allowed; }
      `}</style>
    </div>
  );
}
