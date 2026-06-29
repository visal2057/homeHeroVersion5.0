import { useState } from 'react';

const COMPLAINT_TYPES = [
  'Client Behaviour',
  'Payment Issue',
  'Safety Concern',
  'Platform / App Issue',
  'Other',
];

export default function ProviderComplaintForm({ onSubmit, submitting, error, success }) {
  const [form, setForm] = useState({ type: '', subject: '', description: '' });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  if (success) {
    return (
      <div className="provider-alert success" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>✅</div>
        <p style={{ margin: 0, fontWeight: 600 }}>Complaint submitted successfully.</p>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Our team will review it and get back to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="provider-complaint-wrap">
      {error && <div className="provider-alert error">⚠️ {error}</div>}

      <div className="provider-form-grid">
        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="comp-type">
            Complaint Type <span className="required">*</span>
          </label>
          <select
            id="comp-type"
            name="type"
            className="provider-form-select"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">Select type…</option>
            {COMPLAINT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="comp-subject">
            Subject <span className="required">*</span>
          </label>
          <input
            id="comp-subject"
            name="subject"
            className="provider-form-input"
            value={form.subject}
            onChange={handleChange}
            placeholder="Brief subject line"
            required
          />
        </div>

        <div className="provider-form-group full">
          <label className="provider-form-label" htmlFor="comp-desc">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="comp-desc"
            name="description"
            className="provider-form-textarea"
            style={{ minHeight: 160 }}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail…"
            required
          />
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="btn-spinner" />}
          Submit Complaint
        </button>
      </div>
    </form>
  );
}
