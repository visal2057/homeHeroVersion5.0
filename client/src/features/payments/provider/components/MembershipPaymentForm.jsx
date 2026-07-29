import { useState } from 'react';
import { membershipApi } from '../membershipApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { formatLKR } from '../../client/paymentMath.js';
import { formatCardNumber, formatExpiryDate, formatCVV } from '../../cardFieldFormatting.js';
import FormInput from '../../../../components/common/FormInput.jsx';
import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';

// Card form for buying/renewing a membership. The amount is fixed by the
// backend's quote (the provider can't change the price), so we only collect
// the card details and show what they will be charged.
export default function MembershipPaymentForm({ quote, onCancel, onPaid }) {
  const [form, setForm] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Card fields get live-masked as the user types (spaced digits, MM/YY,
  // etc.) so the input always looks like a real card field regardless of
  // how the value was entered or pasted.
  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'cardNumber') next = formatCardNumber(value);
    else if (name === 'expiryDate') next = formatExpiryDate(value);
    else if (name === 'cvv') next = formatCVV(value);
    setForm({ ...form, [name]: next });
  };

  const validate = () => {
    const next = {};
    if (!form.cardholderName.trim()) next.cardholderName = 'Cardholder name is required.';
    if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) next.cardNumber = 'Enter the 16-digit card number.';
    if (!/^\d{2}\/\d{2}$/.test(form.expiryDate)) next.expiryDate = 'Use MM/YY format.';
    if (!/^\d{3}$/.test(form.cvv)) next.cvv = 'CVV must be 3 digits.';
    return next;
  };

  const handlePayClick = () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length === 0) setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setApiError('');
    try {
      await membershipApi.purchase({
        cardholderName: form.cardholderName,
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        expiryDate: form.expiryDate,
        cvv: form.cvv,
      });
      onPaid();
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mpf">
      <h3 className="mpf-title">Pay {formatLKR(quote.amount)}</h3>
      <p className="mpf-sub">
        {quote.isFirstPayment ? 'First membership payment' : 'Membership renewal'} ·{' '}
        {quote.durationMonths} month · covers {quote.categoryCount}{' '}
        {quote.categoryCount > 1 ? 'categories' : 'category'}
      </p>

      {apiError && <AlertMessage type="error" message={apiError} onDismiss={() => setApiError('')} />}

      <FormInput label="Cardholder name" name="cardholderName" value={form.cardholderName} onChange={handleChange} placeholder="Name on card" error={errors.cardholderName} />
      <FormInput label="Card number" name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={19} error={errors.cardNumber} />
      <div className="mpf-split">
        <FormInput label="Expiry (MM/YY)" name="expiryDate" value={form.expiryDate} onChange={handleChange} placeholder="08/27" maxLength={5} error={errors.expiryDate} />
        <FormInput label="CVV" name="cvv" value={form.cvv} onChange={handleChange} placeholder="123" inputMode="numeric" maxLength={3} error={errors.cvv} />
      </div>

      <div className="mpf-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={handlePayClick} disabled={submitting}>
          {submitting ? 'Processing…' : `Pay ${formatLKR(quote.amount)}`}
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm membership payment"
        message={`You will be charged ${formatLKR(quote.amount)} for your membership.`}
        confirmLabel="Confirm & pay"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <style>{`
        .mpf { padding: var(--space-xl); }
        .mpf-title { font-size: var(--font-size-xl); color: var(--color-neutral-0); }
        .mpf-sub { color: var(--color-neutral-200); font-size: var(--font-size-base); margin-bottom: var(--space-lg); }
        .mpf-split { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
        .mpf-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-lg); }

        /* Same dark-emerald frosted-glass field treatment used on the
           login/registration forms (registration.css .register-glass-box),
           reapplied here since this card gets its glass background from
           .card:has(.mpf) in SubscriptionPage.jsx rather than that class. */
        .mpf .form-label {
          color: var(--color-neutral-0);
          font-weight: 700;
          font-size: var(--font-size-base);
        }
        .mpf .form-control {
          background-color: rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.28);
          color: var(--color-neutral-0);
          font-size: var(--font-size-lg);
          padding: 0.75rem 0.95rem;
        }
        .mpf .form-control::placeholder { color: rgba(255, 255, 255, 0.55); }
        .mpf .form-control:focus {
          background-color: rgba(255, 255, 255, 0.22);
          border-color: var(--color-primary-400);
          box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
        }
        .mpf .form-control.has-error {
          background-color: rgba(220, 38, 38, 0.16);
          border-color: #f87171;
        }
        .mpf .form-error { color: #fca5a5; font-size: var(--font-size-sm); }
        .mpf .form-hint { color: var(--color-neutral-300); }

        .mpf .btn-ghost {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.32);
          color: var(--color-neutral-0);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .mpf .btn-ghost:hover:not(:disabled) { background-color: rgba(255, 255, 255, 0.2); }

        /* This form renders inside the shared Modal, which already pads its
           card by var(--space-xl) — stacked with .mpf's own var(--space-xl)
           padding that's a lot of compounded inset on a narrow phone.
           Trim it and stack the Expiry/CVV split so the fields aren't
           squeezed into a sliver of the modal's already-clamped width. */
        @media (max-width: 480px) {
          .mpf {
            padding: var(--space-md);
          }
          .mpf-split {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
