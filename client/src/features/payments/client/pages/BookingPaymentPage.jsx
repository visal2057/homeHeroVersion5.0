import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { ROUTES } from '../../../../constants/routes.js';
import PaymentSummary from '../components/PaymentSummary.jsx';
import PaymentMethodSelector from '../components/PaymentMethodSelector.jsx';
import PayeeDetails from '../components/PayeeDetails.jsx';
import CashPaymentConfirmation from '../components/CashPaymentConfirmation.jsx';
import CardPaymentForm from '../components/CardPaymentForm.jsx';

// Mock data so the page still renders while the backend is not built yet.
// (Same try-API / fall-back-to-mock pattern used in MyBookingsPage.)
const MOCK_CONTEXT = {
  bookingId: '1',
  providerName: 'Nimal Perera',
  categoryName: 'Gardening',
  status: 'ACCEPTED',
  alreadyPaid: false,
  payee: {
    accountHolderName: 'Nimal Perera',
    bankName: 'Commercial Bank',
    branchName: 'Nugegoda',
    accountLastFour: '4521',
  },
};

export default function BookingPaymentPage() {
  // The booking id comes from the URL: /client/bookings/:bookingId/pay
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('');   // 'CASH' | 'CARD' | ''
  const [step, setStep] = useState('select'); // 'select' | 'cash' | 'card'

  // Load the booking details this page needs.
  const loadContext = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientPaymentApi.getPaymentContext(bookingId);
      setContext(res.data?.data ?? res.data);
    } catch {
      setContext(MOCK_CONTEXT); // backend not ready -> show mock so we can demo
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  // Move from method selection into the chosen flow.
  const handleProceed = () => {
    if (method === 'CASH') setStep('cash');
    if (method === 'CARD') setStep('card');
  };

  // Both flows call this once payment succeeds -> go to the review page.
  const goToReview = () => {
    navigate(ROUTES.CLIENT_BOOKING_REVIEW.replace(':bookingId', bookingId));
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div className="bp-spinner" />
        <p style={{ color: 'var(--color-neutral-500)' }}>Loading payment details…</p>
        <style>{`.bp-spinner { width: 40px; height: 40px; margin: 0 auto var(--space-md); border: 3px solid var(--color-neutral-200); border-top-color: var(--color-primary-500); border-radius: 50%; animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="container bp-grid">
        {/* Left: the booking facts, always visible */}
        <PaymentSummary context={context} />

        {/* Right: changes depending on which step we are on */}
        <div className="bp-main">
          {step === 'select' && (
            <>
              <PaymentMethodSelector value={method} onChange={setMethod} />

              {/* Payee bank details only matter for a card payment */}
              {method === 'CARD' && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <PayeeDetails payee={context.payee} />
                </div>
              )}

              <button
                type="button"
                className="bp-proceed"
                disabled={!method}
                onClick={handleProceed}
              >
                Proceed
              </button>
            </>
          )}

          {step === 'cash' && (
            <CashPaymentConfirmation
              context={context}
              onCancel={() => setStep('select')}
              onPaid={goToReview}
            />
          )}

          {step === 'card' && (
            <CardPaymentForm
              context={context}
              onCancel={() => setStep('select')}
              onPaid={goToReview}
            />
          )}
        </div>
      </div>

      <style>{`
        .bp-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: var(--space-xl); align-items: start; }
        .bp-main { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .bp-proceed { margin-top: var(--space-xl); width: 100%; padding: 12px; background: var(--color-primary-600); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--font-size-base); cursor: pointer; }
        .bp-proceed:hover { background: var(--color-primary-700); }
        .bp-proceed:disabled { background: var(--color-neutral-300); cursor: not-allowed; }
        @media (max-width: 800px) { .bp-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
