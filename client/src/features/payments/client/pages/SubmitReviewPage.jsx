import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { ROUTES } from '../../../../constants/routes.js';
import ReviewForm from '../components/ReviewForm.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';
import EmptyState from '../../../../components/common/EmptyState.jsx';
import { IconStar, IconAlertCircle } from '../../../../components/common/icons.jsx';

export default function SubmitReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadContext = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await clientPaymentApi.getPaymentContext(bookingId);
      setContext(res.data?.data ?? res.data);
    } catch (err) {
      setContext(null);
      setLoadError(extractErrorMessage(err));
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div className="sr-spinner" />
        <p style={{ color: 'var(--color-neutral-500)' }}>Loading booking details…</p>
        <style>{`.sr-spinner { width: 40px; height: 40px; margin: 0 auto var(--space-md); border: 3px solid var(--color-neutral-200); border-top-color: var(--color-primary-500); border-radius: 50%; animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loadError || !context) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <EmptyState
          icon={IconAlertCircle}
          tone="error"
          title="Couldn't load this booking"
          message={loadError || 'Something went wrong loading this booking.'}
          actionLabel="Try Again"
          onAction={loadContext}
        />
      </div>
    );
  }

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
            <div className="sr-hero-text">
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
        .sr-hero-inner { display: flex; align-items: center; gap: var(--space-xl); flex-wrap: wrap; }
        .sr-hero-text { min-width: 0; overflow-wrap: break-word; }
        .sr-hero-icon {
          width: 64px; height: 64px; border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25); box-shadow: var(--shadow-lg);
        }
        .sr-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 6px; }
        .sr-hero-sub { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin: 0; }
        .sr-card {
          background: var(--color-neutral-0); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: var(--space-2xl); box-shadow: var(--shadow-sm);
        }
        .sr-card-header { margin-bottom: var(--space-lg); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-neutral-100); }
        .sr-card-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: 6px; font-weight: 700; }
        .sr-card-sub { color: var(--color-neutral-500); font-size: var(--font-size-sm); margin: 0; }

        @media (max-width: 480px) {
          .sr-card { padding: var(--space-lg) var(--space-md); }
        }
      `}</style>
    </div>
  );
}
