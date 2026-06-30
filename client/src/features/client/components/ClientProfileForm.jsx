import { useState, useEffect } from 'react';
import { clientApi } from '../clientApi.js';

export default function ClientProfileForm({ initialData, onSaved }) {
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ fullName: initialData.fullName ?? '', phone: initialData.phone ?? '' });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!form.fullName?.trim() || !form.phone?.trim()) {
      setError('Full name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      const response = await clientApi.updateProfile(form);
      setSuccess(true);
      onSaved?.(response.data?.data ?? form);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="pf-grid">
        <div className="pf-group pf-group-full">
          <label className="pf-label">Full Name <span className="pf-req">*</span></label>
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="pf-input" required />
        </div>
        <div className="pf-group pf-group-full">
          <label className="pf-label">Phone Number <span className="pf-req">*</span></label>
          <input type="tel" name="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={handleChange} className="pf-input" required />
        </div>
      </div>

      {error && <div className="pf-error">{error}</div>}
      {success && <div className="pf-success">✓ Profile updated successfully!</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary btn-shine" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <style>{`
        .profile-form { display: flex; flex-direction: column; gap: var(--space-lg); }
        .pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
        @media (max-width: 600px) { .pf-grid { grid-template-columns: 1fr; } }
        .pf-group-full { grid-column: 1 / -1; }
        .pf-group { display: flex; flex-direction: column; gap: 6px; }
        .pf-label { font-weight: 600; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .pf-req { color: var(--color-error); }
        .pf-input {
          padding: 10px 14px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
          outline: none; transition: border-color var(--transition-base); background: white; color: var(--color-text);
        }
        .pf-input:focus { border-color: var(--color-primary-500); }
        .pf-error { padding: 10px 14px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .pf-success { padding: 10px 14px; background: var(--color-success-bg); color: var(--color-success); border-radius: var(--radius-md); font-size: var(--font-size-sm); font-weight: 600; }
      `}</style>
    </form>
  );
}
