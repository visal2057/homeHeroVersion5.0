import { useState } from 'react';
import { clientApi } from '../clientApi.js';

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
  const [form, setForm] = useState({
    complaintType: '',
    description: '',
    bookingId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.complaintType || !form.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.description.trim().length < 20) {
      setError('Please provide a more detailed description (at least 20 characters).');
      return;
    }
    setSubmitting(true);
    try {
      await clientApi.submitComplaint(form);
      onSuccess?.();
      setForm({ complaintType: '', description: '', bookingId: '' });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="cf-group">
        <label className="cf-label">Type of Complaint <span style={{ color: 'var(--color-error)' }}>*</span></label>
        <select name="complaintType" value={form.complaintType} onChange={handleChange} className="cf-input" required>
          <option value="">Select complaint type...</option>
          {COMPLAINT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="cf-group">
        <label className="cf-label">Booking Reference (optional)</label>
        <input
          type="text"
          name="bookingId"
          placeholder="e.g. BK-12345 (if applicable)"
          value={form.bookingId}
          onChange={handleChange}
          className="cf-input"
        />
      </div>

      <div className="cf-group">
        <label className="cf-label">Description <span style={{ color: 'var(--color-error)' }}>*</span></label>
        <textarea
          name="description"
          rows={5}
          placeholder="Please describe the issue in detail..."
          value={form.description}
          onChange={handleChange}
          className="cf-input cf-textarea"
          required
        />
        <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)', marginTop: 4 }}>
          {form.description.length} chars
        </div>
      </div>

      {error && <div className="cf-error">{error}</div>}

      <button type="submit" className="btn btn-primary btn-shine" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Submitting…' : '📣 Submit Complaint'}
      </button>

      <style>{`
        .complaint-form { display: flex; flex-direction: column; gap: var(--space-lg); }
        .cf-group { display: flex; flex-direction: column; gap: 6px; }
        .cf-label { font-weight: 600; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .cf-input {
          padding: 10px 14px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
          outline: none; transition: border-color var(--transition-base); background: white; color: var(--color-text);
        }
        .cf-input:focus { border-color: var(--color-primary-500); }
        .cf-textarea { resize: vertical; }
        .cf-error { padding: 10px 14px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
      `}</style>
    </form>
  );
}
