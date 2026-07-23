import { useState } from 'react';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { formatLKR, calculateCardTotals } from '../paymentMath.js';
import { formatCardNumber, formatExpiryDate, formatCVV } from '../../cardFieldFormatting.js';
import FormInput from '../../../../components/common/FormInput.jsx';
import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';
import { useAlert } from '../../../../hooks/useAlert.js';

// Card flow: HomeHero processes the payment and keeps the 5% platform fee.
// We collect the card details, show the client the fee breakdown, then
// send everything to the backend (which re-checks the amounts).
export default function CardPaymentForm({ context, onCancel, onPaid }) {
  const [form, setForm] = useState({
    serviceAmount: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const { showSuccess } = useAlert();

  // The client enters the price they agreed with the provider; the fee
  // breakdown updates live from it. The backend calculates the fee again.
  const totals = calculateCardTotals(form.serviceAmount);

  // One handler updates whichever field changed by its `name`. The card
  // fields get live-masked as the user types (spaced digits, MM/YY, etc.)
  // so the input always looks like a real card field regardless of how
  // the value was entered or pasted.
  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'cardNumber') next = formatCardNumber(value);
    else if (name === 'expiryDate') next = formatExpiryDate(value);
    else if (name === 'cvv') next = formatCVV(value);
    setForm({ ...form, [name]: next });
  };

  // Simple, readable checks. Returns an object of { field: message }.
  const validate = () => {
    const next = {};
    if (!(Number(form.serviceAmount) > 0)) next.serviceAmount = 'Enter the agreed service amount.';

    if (!form.cardholderName.trim()) next.cardholderName = 'Cardholder name is required.';

    const digits = form.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) next.cardNumber = 'Enter the 16-digit card number.';

    if (!/^\d{2}\/\d{2}$/.test(form.expiryDate)) next.expiryDate = 'Use MM/YY format.';

    if (!/^\d{3}$/.test(form.cvv)) next.cvv = 'CVV must be 3 digits.';

    return next;
  };

  // Pay clicked: validate first, only then open the confirmation popup.
  const handlePayClick = () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length === 0) setShowConfirm(true);
  };

  // Runs after the client confirms in the popup.
  const handleConfirm = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setApiError('');
    try {
      await clientPaymentApi.payByCard(context.bookingId, {
        serviceAmount: Number(form.serviceAmount),
        cardholderName: form.cardholderName,
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        expiryDate: form.expiryDate,
        cvv: form.cvv,
      });
      showSuccess('Payment successful. Please submit a review for the job.');
      onPaid(); // success -> parent sends us to the review page
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="cf-title">💳 Card payment</h2>

      {apiError && <AlertMessage type="error" message={apiError} onDismiss={() => setApiError('')} />}

      <FormInput
        label="Service amount (LKR)" name="serviceAmount"
        value={form.serviceAmount} onChange={handleChange}
        placeholder="10000" inputMode="numeric"
        hint="The price you agreed with the provider."
        error={errors.serviceAmount}
      />
      <FormInput
        label="Cardholder name" name="cardholderName"
        value={form.cardholderName} onChange={handleChange}
        placeholder="Name on card" error={errors.cardholderName}
      />
      <FormInput
        label="Card number" name="cardNumber"
        value={form.cardNumber} onChange={handleChange}
        placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={19}
        error={errors.cardNumber}
      />
      <div className="cf-split">
        <FormInput
          label="Expiry (MM/YY)" name="expiryDate"
          value={form.expiryDate} onChange={handleChange}
          placeholder="08/27" maxLength={5} error={errors.expiryDate}
        />
        <FormInput
          label="CVV" name="cvv"
          value={form.cvv} onChange={handleChange}
          placeholder="123" inputMode="numeric" maxLength={3} error={errors.cvv}
        />
      </div>

      {/* Fee breakdown so the client sees exactly what they will be charged */}
      <div className="cf-breakdown">
        <div className="cf-line"><span>Service amount</span><span>{formatLKR(totals.serviceAmount)}</span></div>
        <div className="cf-line"><span>Platform fee (5%)</span><span>{formatLKR(totals.platformFee)}</span></div>
        <div className="cf-line cf-total"><span>Total to pay</span><span>{formatLKR(totals.total)}</span></div>
      </div>

      <div className="cf-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={handlePayClick} disabled={submitting}>
          {submitting ? 'Processing…' : `Pay ${formatLKR(totals.total)}`}
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm payment"
        message={`You will be charged ${formatLKR(totals.total)} (service ${formatLKR(totals.serviceAmount)} + 5% fee ${formatLKR(totals.platformFee)}).`}
        confirmLabel="Confirm & pay"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <style>{`
        .cf-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .cf-split { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
        .cf-breakdown { margin-top: var(--space-lg); padding: var(--space-md) var(--space-lg); background: var(--color-neutral-50); border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); }
        .cf-line { display: flex; justify-content: space-between; padding: 6px 0; font-size: var(--font-size-sm); color: var(--color-neutral-600); }
        .cf-total { border-top: 1px solid var(--color-neutral-200); margin-top: 4px; padding-top: 10px; font-size: var(--font-size-base); font-weight: 700; color: var(--color-primary-700); }
        .cf-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-lg); }
      `}</style>
    </div>
  );
}
