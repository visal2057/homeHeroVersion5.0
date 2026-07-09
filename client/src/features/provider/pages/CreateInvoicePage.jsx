import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProviderPageHero from '../components/ProviderPageHero.jsx';
import FormInput from '../../../components/common/FormInput.jsx';
import AlertMessage from '../../../components/common/AlertMessage.jsx';
import ConfirmModal from '../../../components/common/ConfirmModal.jsx';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { invoiceApi } from '../invoiceApi.js';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80';

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)', padding: '6px 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right' }}>{value ?? '—'}</span>
    </div>
  );
}

export default function CreateInvoicePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      setLoading(true);
      try {
        const { data } = await invoiceApi.getForm(bookingId);
        if (!isMounted) return;
        setForm(data.data.form);
        setAmount(data.data.form.amount ?? '');
      } catch (err) {
        if (isMounted) setLoadError(extractErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadForm();
    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  function handleGenerateClick() {
    setFormError('');
    if (form.amountEditable && !(Number(amount) > 0)) {
      setFormError('Enter the amount agreed and received from the Client.');
      return;
    }
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await invoiceApi.generate(bookingId, form.amountEditable ? { amount: Number(amount) } : {});
      navigate(-1);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await invoiceApi.download(bookingId);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="provider-page">
      <ProviderPageHero
        title={form?.invoiceExists ? 'Invoice' : 'Create Invoice'}
        subtitle={`Booking #${bookingId}`}
        image={HERO_IMAGE}
      />

      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : loadError ? (
        <AlertMessage type="error" message={loadError} />
      ) : (
        <div className="provider-card">
          <div className="provider-card-body" style={{ maxWidth: 520 }}>
            {formError && (
              <AlertMessage type="error" message={formError} onDismiss={() => setFormError('')} />
            )}

            <DetailRow label="Service category" value={form.serviceCategory} />
            <DetailRow label="Client" value={form.clientName} />
            <DetailRow label="Job location" value={form.jobLocation} />
            <DetailRow label="Booking date" value={form.scheduledAt ? new Date(form.scheduledAt).toLocaleString() : null} />
            <DetailRow label="Completion date" value={form.completedAt ? new Date(form.completedAt).toLocaleDateString() : null} />
            <DetailRow label="Payment method" value={form.paymentMethod} />
            <DetailRow label="Job description" value={form.jobDescription} />

            <div style={{ marginTop: 'var(--space-lg)' }}>
              <FormInput
                label="Amount (LKR)"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly={!form.amountEditable}
                disabled={!form.amountEditable}
                hint={
                  form.amountEditable
                    ? 'Enter the amount agreed and received directly from the Client.'
                    : 'Locked to the amount HomeHero recorded for this Card payment.'
                }
              />
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-md)' }}>
              {form.closingLine}
              <br />
              {form.providerName}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
              {form.invoiceExists ? (
                <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
                  {downloading ? 'Downloading…' : 'Download Invoice'}
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleGenerateClick} disabled={submitting}>
                  {submitting ? 'Generating…' : 'Generate Invoice'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Generate invoice"
        message={`Generate an invoice for LKR ${Number(amount || 0).toFixed(2)}? This can only be done once per job.`}
        confirmLabel="Generate"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
