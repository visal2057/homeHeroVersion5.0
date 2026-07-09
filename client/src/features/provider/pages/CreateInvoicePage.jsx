import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../../../components/common/FormInput.jsx';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { getInvoiceForm, generateInvoice, downloadInvoice } from '../invoiceApi.js';

export default function CreateInvoicePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const [form, setForm] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      setIsLoading(true);
      try {
        const { data } = await getInvoiceForm(bookingId);
        if (!isMounted) return;
        setForm(data.data.form);
        setAmount(data.data.form.amount ?? '');
      } catch (apiError) {
        if (isMounted) setLoadError(extractErrorMessage(apiError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadForm();
    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  async function handleGenerate(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await generateInvoice(bookingId, form.amountEditable ? { amount: Number(amount) } : {});
      showSuccess('Invoice generated successfully.');
      navigate(-1);
    } catch (apiError) {
      showError(extractErrorMessage(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDownload() {
    try {
      await downloadInvoice(bookingId);
    } catch (apiError) {
      showError(extractErrorMessage(apiError));
    }
  }

  if (isLoading) {
    return (
      <div className="container section">
        <p>Loading invoice details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container section">
        <p className="form-error">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title">{form.invoiceExists ? 'Invoice' : 'Create Invoice'}</h1>
      <p className="section-subtitle">Booking {form.bookingId}</p>

      <div className="card" style={{ padding: 'var(--space-xl)', maxWidth: 560 }}>
        <FormInput label="Service category" value={form.serviceCategoryName ?? ''} readOnly disabled />
        <FormInput label="Client" value={form.clientName ?? ''} readOnly disabled />
        <FormInput label="Job location" value={form.jobLocation ?? ''} readOnly disabled />
        <FormInput label="Booking date" value={form.bookingDate ?? ''} readOnly disabled />
        <FormInput label="Completion date" value={form.completionDate ?? ''} readOnly disabled />
        <FormInput label="Payment method" value={form.paymentMethod ?? ''} readOnly disabled />
        <div className="form-group">
          <label className="form-label" htmlFor="jobDescription">
            Job description
          </label>
          <p id="jobDescription" className="form-control" style={{ minHeight: 60 }}>
            {form.jobDescription}
          </p>
        </div>

        {form.invoiceExists ? (
          <button type="button" className="btn btn-primary btn-block" onClick={handleDownload}>
            Download Invoice
          </button>
        ) : (
          <form onSubmit={handleGenerate}>
            <FormInput
              label="Amount (LKR)"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              readOnly={!form.amountEditable}
              disabled={!form.amountEditable}
              hint={
                form.amountEditable
                  ? 'Enter the amount agreed and received directly from the Client.'
                  : 'Locked to the amount HomeHero recorded for this Card payment.'
              }
            />
            <p className="form-hint">{form.closingLine}</p>
            <p className="form-hint">{form.providerName}</p>
            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Generate Invoice'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
