import { useState } from 'react';
import { IconCheckCircle, IconAlertCircle } from '../../../components/common/icons.jsx';

export default function ProviderComplaintForm({ onSubmit, submitting, error, success }) {
  const [form, setForm] = useState({ token: '', description: '' });

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
      <div className="provider-alert success" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ marginBottom: 'var(--space-sm)' }}><IconCheckCircle size={32} /></div>
        <p style={{ margin: 0, fontWeight: 600 }}>Complaint submitted successfully.</p>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Our team will review it and get back to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="provider-complaint-wrap">
      {error && (
        <div className="provider-alert error">
          <IconAlertCircle size={16} /> {error}
        </div>
      )}

      <div className="provider-form-grid">
        <div className="provider-form-group full">
          <label className="provider-form-label" htmlFor="comp-token">
            Complaint For — Client Token <span className="required">*</span>
          </label>
          <input
            id="comp-token"
            name="token"
            className="provider-form-input"
            value={form.token}
            onChange={handleChange}
            placeholder="e.g. A7b2X9"
            maxLength={6}
            required
          />
          <span className="provider-form-hint">Enter the unique 6-character token of the Client you're reporting.</span>
        </div>

        <div className="provider-form-group full">
          <label className="provider-form-label" htmlFor="comp-desc">
            Complaint Details <span className="required">*</span>
          </label>
          <textarea
            id="comp-desc"
            name="description"
            className="provider-form-textarea"
            style={{ minHeight: 160 }}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail (minimum 20 characters)…"
            required
            minLength={20}
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
