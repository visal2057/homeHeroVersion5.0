import { useState } from 'react';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';
import { useAlert } from '../../../../hooks/useAlert.js';
import { IconDollarSign } from '../../../../components/common/icons.jsx';

// Cash flow: the client pays the provider directly, so HomeHero collects
// nothing and the commission is zero. We only record that it happened.
export default function CashPaymentConfirmation({ context, onCancel, onPaid }) {
  const [showConfirm, setShowConfirm] = useState(false); // is the popup open?
  const [submitting, setSubmitting] = useState(false);    // waiting on the API?
  const [error, setError] = useState('');
  const { showSuccess } = useAlert();

  // Runs when the client confirms inside the popup.
  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await clientPaymentApi.confirmCashPayment(context.bookingId);
      showSuccess('Your work is done. Please submit a review for the job.');
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
      <h2 className="cash-title"><IconDollarSign size={20} /> Cash payment</h2>
      <p className="cash-note">
        You will pay the agreed amount directly to{' '}
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
        message={`Confirm that you have paid ${context.providerName} in cash. You will then leave a review.`}
        confirmLabel="Yes, I paid"
        cancelLabel="Not yet"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <style>{`
        .cash-title { display: flex; align-items: center; gap: 8px; font-size: var(--font-size-lg); font-weight: 700; color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .cash-note {
          color: var(--color-neutral-700); line-height: 1.6; margin-bottom: var(--space-lg);
          background: var(--color-primary-50); border: 1px solid var(--color-primary-200);
          border-radius: var(--radius-md); padding: var(--space-md) var(--space-lg);
        }
        .cash-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-lg); }

        @media (max-width: 480px) {
          .cash-actions { flex-direction: column-reverse; }
          .cash-actions .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
