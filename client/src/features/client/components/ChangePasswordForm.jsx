import { useState } from 'react';
import { clientApi } from '../clientApi.js';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (form.newPassword !== form.confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await clientApi.changePassword(form);
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="pf-grid">
        <div className="pf-group pf-group-full">
          <label className="pf-label">Current Password <span className="pf-req">*</span></label>
          <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} className="pf-input" required />
        </div>
        <div className="pf-group">
          <label className="pf-label">New Password <span className="pf-req">*</span></label>
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className="pf-input" required />
        </div>
        <div className="pf-group">
          <label className="pf-label">Confirm New Password <span className="pf-req">*</span></label>
          <input type="password" name="confirmNewPassword" value={form.confirmNewPassword} onChange={handleChange} className="pf-input" required />
        </div>
      </div>

      {error && <div className="pf-error">{error}</div>}
      {success && <div className="pf-success">✓ Password updated successfully!</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
