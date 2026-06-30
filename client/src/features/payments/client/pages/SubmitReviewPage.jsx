import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientPaymentApi } from '../clientPaymentApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { ROUTES } from '../../../../constants/routes.js';
import ReviewForm from '../components/ReviewForm.jsx';
import AlertMessage from '../../../../components/common/AlertMessage.jsx';

// Reuse the same context call so we can show who the review is about,
// even if the client opened this page directly.
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
      setContext(MOCK_CONTEXT); // backend not ready -> keep the demo working
    }
  }, [bookingId]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  // Called by ReviewForm once the rating + text are valid.
  const handleSubmit = async ({ rating, reviewText }) => {
    setSubmitting(true);
    setError('');
    try {
      await clientPaymentApi.submitReview(bookingId, { rating, reviewText });
      // Submitting the review is what marks the booking Completed.
      navigate(ROUTES.CLIENT_PAYMENT_SUCCESS.replace(':bookingId', bookingId));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="sr-card">
          <h1 className="sr-title">⭐ Leave a review</h1>
          {error && <AlertMessage type="error" message={error} onDismiss={() => setError('')} />}
          <ReviewForm
            providerName={context.providerName}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>

      <style>{`
        .sr-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-2xl); }
        .sr-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: var(--space-lg); }
      `}</style>
    </div>
  );
}
