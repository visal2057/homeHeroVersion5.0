import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { ROUTES } from '../../../../constants/routes.js';
import PaymentSummary from '../components/PaymentSummary.jsx';
import PaymentMethodSelector from '../components/PaymentMethodSelector.jsx';
import PayeeDetails from '../components/PayeeDetails.jsx';
import CashPaymentConfirmation from '../components/CashPaymentConfirmation.jsx';
import CardPaymentForm from '../components/CardPaymentForm.jsx';
import EmptyState from '../../../../components/common/EmptyState.jsx';
import { IconCreditCard, IconAlertCircle, IconCheckCircle } from '../../../../components/common/icons.jsx';

export default function BookingPaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('');
  const [step, setStep] = useState('select');

  const loadContext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientPaymentApi.getPaymentContext(bookingId);
      setContext(res.data?.data ?? res.data);
    } catch (err) {
      setContext(null);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { loadContext(); }, [loadContext]);

  const handleProceed = () => {
    if (method === 'CASH') setStep('cash');
    if (method === 'CARD') setStep('card');
  };

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

  if (error || !context) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <EmptyState
          icon={IconAlertCircle}
          tone="error"
          title="Couldn't load payment details"
          message={error || 'Something went wrong loading this booking.'}
          actionLabel="Try Again"
          onAction={loadContext}
        />
      </div>
    );
  }

  return (
    <div className="bp-page">
      {/* Hero */}
      <div className="bp-hero">
        <div className="bp-hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="bp-hero-inner">
            <div className="bp-hero-icon">
              <IconCreditCard size={32} style={{ color: 'white' }} />
            </div>
            <div className="bp-hero-text">
              <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>Payment</div>
              <h1 className="bp-hero-title">Complete Your Payment</h1>
              <p className="bp-hero-sub">
                Booking <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{bookingId}</span>
                {context?.providerName ? ` · ${context.providerName}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container bp-body">
        <div className="bp-grid">
          <PaymentSummary context={context} />

          <div className="bp-main">
            {context.alreadyPaid ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                <IconCheckCircle size={48} style={{ color: 'var(--color-secondary-600)', marginBottom: 'var(--space-md)' }} />
                <h3 style={{ marginBottom: 6 }}>This booking has already been paid</h3>
                <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-lg)' }}>
                  Continue to leave your review and finish this job.
                </p>
                <button type="button" className="bp-proceed" onClick={goToReview}>
                  Continue to Review
                </button>
              </div>
            ) : step === 'select' && (
              <>
                <PaymentMethodSelector value={method} onChange={setMethod} />
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
      </div>

      <style>{`
        .bp-page { padding-bottom: var(--space-2xl); }
        .bp-hero {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=2000&q=80');
          background-size: cover; background-position: center; padding: 56px 0;
        }
        .bp-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,45,25,0.60) 0%, rgba(21,128,61,0.42) 100%);
        }
        .bp-hero-inner { display: flex; align-items: center; gap: var(--space-xl); flex-wrap: wrap; }
        .bp-hero-text { min-width: 0; overflow-wrap: break-word; }
        .bp-hero-icon {
          width: 64px; height: 64px; border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .bp-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 6px; }
        .bp-hero-sub { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin: 0; }
        .bp-body { padding-top: var(--space-2xl); }
        .bp-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: var(--space-xl); align-items: start; }
        @media (max-width: 800px) { .bp-grid { grid-template-columns: 1fr; } }
        .bp-main { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .bp-proceed {
          margin-top: var(--space-xl); width: 100%; padding: 12px;
          background: var(--color-primary-600); color: white; border: none;
          border-radius: var(--radius-md); font-weight: 600; font-size: var(--font-size-base); cursor: pointer;
        }
        .bp-proceed:hover { background: var(--color-primary-700); }
        .bp-proceed:disabled { background: var(--color-neutral-300); cursor: not-allowed; }
      `}</style>
    </div>
  );
}
