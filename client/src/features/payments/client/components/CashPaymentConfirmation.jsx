import { useState } from 'react';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { formatLKR } from '../paymentMath.js';
import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';

// Cash flow: the client pays the provider directly, so HomeHero collects
// nothing and the commission is zero. We only record that it happened.
export default function CashPaymentConfirmation({ context, onCancel, onPaid }) {
  const [showConfirm, setShowConfirm] = useState(false); // is the popup open?
  const [submitting, setSubmitting] = useState(false);    // waiting on the API?
  const [error, setError] = useState('');

  // Runs when the client confirms inside the popup.
  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await clientPaymentApi.confirmCashPayment(context.bookingId);
      onPaid(); // success -> parent sends us to the review page
    } catch (err) {
      setError(extractErrorMessage(err));
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="cash-title">💵 Cash payment</h2>
      <p className="cash-note">
        You will pay <strong>{formatLKR(context.serviceAmount)}</strong> directly to{' '}
        <strong>{context.providerName}</strong>. HomeHero does not collect cash and
        takes no fee on cash payments.
      </p>

      {error && <AlertMessage type="error" message={error} onDismiss={() => setError('')} />}

      <div className="cash-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setShowConfirm(true)} disabled={submitting}>
          {submitting ? 'Saving…' : 'I have paid in cash'}
        </button>
      </div>

      {/* The confirmation popup the flow requires before we record anything */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm cash payment"
        message={`Confirm that you have paid ${formatLKR(context.serviceAmount)} in cash to ${context.providerName}. You will then leave a review.`}
        confirmLabel="Yes, I paid"
        cancelLabel="Not yet"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <style>{`
        .cash-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .cash-note { color: var(--color-neutral-600); line-height: 1.6; margin-bottom: var(--space-lg); }
        .cash-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-lg); }
      `}</style>
    </div>
  );
}
