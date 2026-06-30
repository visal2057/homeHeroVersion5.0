import { useEffect, useState, useCallback } from 'react';
import { paymentSettingsApi } from '../paymentSettingsApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import FormInput from '../../../../components/common/FormInput.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';

// The provider's bank details form. I own this component; Maheli places it
// inside the Profile & Settings page. These details are what a client's card
// payment is sent to, so only the provider can edit their own.
export default function PaymentSettingsSection() {
  const [form, setForm] = useState({
    accountNumber: '',
    bankName: '',
    branchName: '',
    accountHolderName: '',
  });
  const [savedLastFour, setSavedLastFour] = useState(''); // shown for the existing account
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, message }

  // Load any details the provider has already saved.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentSettingsApi.get();
      const data = res.data?.data ?? res.data;
      if (data) {
        // We never receive the full account number back, only the last four.
        setForm({
          accountNumber: '',
          bankName: data.bankName ?? '',
          branchName: data.branchName ?? '',
          accountHolderName: data.accountHolderName ?? '',
        });
        setSavedLastFour(data.accountLastFour ?? '');
      }
    } catch {
      // No saved settings yet (or backend down) - just show an empty form.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Same rules as the backend, so the provider gets feedback before saving.
  const validate = () => {
    const next = {};
    if (!/^\d{6,20}$/.test(form.accountNumber)) next.accountNumber = 'Account number must be 6-20 digits.';
    if (!form.bankName.trim()) next.bankName = 'Bank is required.';
    if (!form.branchName.trim()) next.branchName = 'Branch is required.';
    if (!form.accountHolderName.trim()) next.accountHolderName = 'Account holder name is required.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const res = await paymentSettingsApi.save(form);
      const data = res.data?.data ?? res.data;
      setSavedLastFour(data?.accountLastFour ?? form.accountNumber.slice(-4));
      setForm({ ...form, accountNumber: '' }); // clear the sensitive field after saving
      setFeedback({ type: 'success', message: 'Payment settings saved.' });
    } catch (err) {
      setFeedback({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--color-neutral-500)' }}>Loading payment settings…</p>;

  return (
    <form onSubmit={handleSubmit} className="pset">
      <h3 className="pset-title">💳 Payment settings</h3>
      <p className="pset-sub">Clients paying by card will send the money to this account.</p>

      {savedLastFour && (
        <p className="pset-current">Current account on file: <strong>•••• {savedLastFour}</strong></p>
      )}

      {feedback && <AlertMessage type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />}

      <FormInput
        label="Account number" name="accountNumber"
        value={form.accountNumber} onChange={handleChange}
        placeholder={savedLastFour ? 'Enter to replace the saved number' : 'e.g. 100200300400'}
        inputMode="numeric" error={errors.accountNumber}
      />
      <FormInput
        label="Account holder name" name="accountHolderName"
        value={form.accountHolderName} onChange={handleChange}
        placeholder="Name on the bank account" error={errors.accountHolderName}
      />
      <div className="pset-split">
        <FormInput label="Bank" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Commercial Bank" error={errors.bankName} />
        <FormInput label="Branch" name="branchName" value={form.branchName} onChange={handleChange} placeholder="Nugegoda" error={errors.branchName} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Save payment settings'}
      </button>

      <style>{`
        .pset { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .pset-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: 4px; }
        .pset-sub { color: var(--color-neutral-500); font-size: var(--font-size-sm); margin-bottom: var(--space-md); }
        .pset-current { font-size: var(--font-size-sm); color: var(--color-neutral-600); margin-bottom: var(--space-md); }
        .pset-split { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
      `}</style>
    </form>
  );
}
