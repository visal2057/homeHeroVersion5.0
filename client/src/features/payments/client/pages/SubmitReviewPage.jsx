import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { ROUTES } from '../../../../constants/routes.js';
import ReviewForm from '../components/ReviewForm.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';
import { IconStar } from '../../../../components/common/icons.jsx';

const MOCK_CONTEXT = { bookingId: '1', providerName: 'Nimal Perera' };

export default function SubmitReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [context, setContext] = useState(MOCK_CONTEXT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadContext = useCallback(async () => {
    try {
      const res = await clientPaymentApi.getPaymentContext(bookingId);
      setContext(res.data?.data ?? res.data);
    } catch {
      setContext(MOCK_CONTEXT);
    }
  }, [bookingId]);

  useEffect(() => { loadContext(); }, [loadContext]);

  const handleSubmit = async ({ rating, reviewText }) => {
    setSubmitting(true);
    setError('');
    try {
      await clientPaymentApi.submitReview(bookingId, { rating, reviewText });
      navigate(ROUTES.CLIENT_PAYMENT_SUCCESS.replace(':bookingId', bookingId));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-page">
      {/* Hero */}
      <div className="sr-hero">
        <div className="sr-hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="sr-hero-inner">
            <div className="sr-hero-icon">
              <IconStar size={32} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>Review</div>
              <h1 className="sr-hero-title">Leave a Review</h1>
              <p className="sr-hero-sub">Share your experience to help others find great providers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 640, paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <div className="sr-card">
          <div className="sr-card-header">
            <h2 className="sr-card-title">How was your experience?</h2>
            {context?.providerName && (
              <p className="sr-card-sub">You are reviewing <strong>{context.providerName}</strong> for booking <span style={{ fontFamily: 'monospace' }}>#{bookingId}</span></p>
            )}
          </div>
          {error && <AlertMessage type="error" message={error} onDismiss={() => setError('')} />}
          <ReviewForm
            providerName={context.providerName}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>

      <style>{`
        .sr-page { padding-bottom: var(--space-2xl); }
        .sr-hero {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=2000&q=80');
          background-size: cover; background-position: center; padding: 56px 0;
        }
        .sr-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,45,25,0.60) 0%, rgba(21,128,61,0.42) 100%);
        }
        .sr-hero-inner { display: flex; align-items: center; gap: var(--space-xl); }
        .sr-hero-icon {
          width: 64px; height: 64px; border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .sr-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 6px; }
        .sr-hero-sub { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin: 0; }
        .sr-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-2xl); }
        .sr-card-header { margin-bottom: var(--space-lg); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-neutral-100); }
        .sr-card-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: 6px; font-weight: 700; }
        .sr-card-sub { color: var(--color-neutral-500); font-size: var(--font-size-sm); margin: 0; }
      `}</style>
    </div>
  );
}
