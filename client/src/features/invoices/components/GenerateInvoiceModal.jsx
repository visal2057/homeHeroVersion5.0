import { useEffect, useState } from 'react';
import { IconXCircle, IconAlertCircle } from '../../../components/common/icons.jsx';
import { invoiceApi } from '../invoiceApi.js';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

// Dinuka's Create Invoice page (Section 14.2), built as a modal to match
// this codebase's existing pattern for row-action quick forms
// (CreatePortfolioPostModal).
export default function GenerateInvoiceModal({ bookingId, onClose, onGenerated }) {
  const [status, setStatus] = useState(null);
  const [cashAmount, setCashAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    invoiceApi.getStatus(bookingId)
      .then((res) => { if (!cancelled) setStatus(res.data?.data ?? res.data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message ?? 'Could not load invoice details.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [bookingId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (status?.paymentMethod === 'CASH' && (!cashAmount || Number(cashAmount) <= 0)) {
      setError('Enter the amount received for this job.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await invoiceApi.generate(bookingId, status?.paymentMethod === 'CASH' ? Number(cashAmount) : undefined);
      onGenerated();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not generate the invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="provider-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="invoice-modal-title">
      <div className="provider-modal">
        <div className="provider-modal-header">
          <h2 className="provider-modal-title" id="invoice-modal-title">Create Invoice</h2>
          <button type="button" className="provider-modal-close" onClick={onClose} aria-label="Close">
            <IconXCircle size={16} />
          </button>
        </div>

        {loading ? (
          <div className="provider-modal-body"><div className="provider-spinner" /></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="provider-modal-body">
              {error && (
                <div className="provider-alert error">
                  <IconAlertCircle size={16} /> {error}
                </div>
              )}

              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Booking ID</label>
                <div>#{status?.bookingId}</div>
              </div>
              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Job description</label>
                <div>{status?.jobDescription}</div>
              </div>
              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Service category</label>
                <div>{status?.categoryName}</div>
              </div>
              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Client name</label>
                <div>{status?.clientName}</div>
              </div>
              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Job location</label>
                <div>{status?.location ?? '—'}</div>
              </div>
              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Booking date</label>
                <div>{formatDate(status?.bookingDate)}</div>
              </div>
              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Completion date</label>
                <div>{formatDate(status?.completionDate)}</div>
              </div>
              <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="provider-form-label">Payment method</label>
                <div>{status?.paymentMethod ?? '—'}</div>
              </div>

              <div className="provider-form-group">
                <label className="provider-form-label" htmlFor="invoice-amount">
                  Amount <span className="required">*</span>
                </label>
                {status?.paymentMethod === 'CARD' ? (
                  <input
                    id="invoice-amount"
                    className="provider-form-input"
                    value={`LKR ${Number(status?.lockedAmount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    disabled
                    readOnly
                  />
                ) : (
                  <input
                    id="invoice-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="provider-form-input"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Enter the amount received"
                    required
                  />
                )}
              </div>
            </div>

            <div className="provider-modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving && <span className="btn-spinner" />}
                Generate Invoice
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
