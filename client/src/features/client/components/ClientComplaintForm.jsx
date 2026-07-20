import { useState } from 'react';
import { clientApi } from '../clientApi.js';
import { IconSend } from '../../../components/common/icons.jsx';

const COMPLAINT_TYPES = [
  'Service Quality',
  'Provider Behaviour',
  'No Show',
  'Late Arrival',
  'Property Damage',
  'Billing Issue',
  'Other',
];

export default function ClientComplaintForm({ onSuccess }) {
  const [form, setForm] = useState({ token: '', complaintType: '', description: '', bookingId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.token.trim()) {
      setError('Please enter the service provider token.');
      return;
    }
    if (!form.complaintType) {
      setError('Please select a complaint type.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please provide a description.');
      return;
    }
    if (form.description.trim().length < 20) {
      setError('Please provide more detail (at least 20 characters).');
      return;
    }
    setSubmitting(true);
    try {
      await clientApi.submitComplaint({
        token: form.token.trim().toUpperCase(),
        complaintType: form.complaintType,
        description: form.description.trim(),
        bookingId: form.bookingId.trim() || undefined,
      });
      onSuccess?.();
      setForm({ token: '', complaintType: '', description: '', bookingId: '' });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="cf-group">
        <label className="cf-label">
          Provider Token <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="text"
          name="token"
          placeholder="e.g. NPR4X2"
          value={form.token}
          onChange={handleChange}
          className="cf-input cf-token"
          maxLength={10}
          required
        />
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)', marginTop: 4 }}>
          Enter the unique token of the service provider (found on their profile page)
        </div>
      </div>

      <div className="cf-group">
        <label className="cf-label">Booking ID (optional)</label>
        <input
          type="text"
          name="bookingId"
          placeholder="e.g. 42"
          value={form.bookingId}
          onChange={handleChange}
          className="cf-input"
        />
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)', marginTop: 4 }}>
          If this complaint relates to a specific booking, enter its ID (found on My Bookings)
        </div>
      </div>

      <div className="cf-group">
        <label className="cf-label">
          Type of Complaint <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <select name="complaintType" value={form.complaintType} onChange={handleChange} className="cf-input" required>
          <option value="">Select complaint type...</option>
          {COMPLAINT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="cf-group">
        <label className="cf-label">
          Description <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <textarea
          name="description"
          rows={5}
          placeholder="Please describe the issue in detail (minimum 20 characters)..."
          value={form.description}
          onChange={handleChange}
          className="cf-input cf-textarea"
          required
        />
        <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)', color: form.description.length < 20 && form.description.length > 0 ? 'var(--color-error)' : 'var(--color-neutral-400)', marginTop: 4 }}>
          {form.description.length} chars {form.description.length < 20 ? `(need ${20 - form.description.length} more)` : ''}
        </div>
      </div>

      {error && <div className="cf-error">{error}</div>}

      <button type="submit" className="btn btn-primary btn-shine" disabled={submitting} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <IconSend size={19} />
        {submitting ? 'Submitting…' : 'Submit Complaint'}
      </button>

      <style>{`
        .complaint-form { display: flex; flex-direction: column; gap: var(--space-lg); }
        .cf-group { display: flex; flex-direction: column; gap: 6px; }
        .cf-label { font-weight: 600; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .cf-input {
          padding: 12px 17px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
          outline: none; transition: border-color var(--transition-base); background: white; color: var(--color-text);
        }
        .cf-input:focus { border-color: var(--color-primary-500); }
        .cf-token { font-family: monospace; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
        .cf-textarea { resize: vertical; }
        .cf-error { padding: 12px 17px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
      `}</style>
    </form>
  );
}
