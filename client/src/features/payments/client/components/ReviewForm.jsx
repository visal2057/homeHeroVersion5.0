import { useState } from 'react';
import FormTextarea from '../../../../components/common/FormTextarea.jsx';

// The form a client fills in after paying: a 1-5 star rating and some text.
// `onSubmit` is called with { rating, reviewText } only when both are valid.
export default function ReviewForm({ providerName, onSubmit, submitting }) {
  const [rating, setRating] = useState(0);     // 0 means "not chosen yet"
  const [reviewText, setReviewText] = useState('');
  const [errors, setErrors] = useState({});

  // We always draw 5 stars; a star is filled when its number <= rating.
  const stars = [1, 2, 3, 4, 5];

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    if (rating < 1) found.rating = 'Please select a rating.';
    if (!reviewText.trim()) found.reviewText = 'Please write a short review.';
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ rating, reviewText: reviewText.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="rv-lead">How was your service from <strong>{providerName}</strong>?</p>

      {/* Star rating input */}
      <div className="form-group">
        <label className="form-label">Your rating</label>
        <div className="rv-stars">
          {stars.map((n) => (
            <button
              key={n}
              type="button"
              className={`rv-star ${n <= rating ? 'rv-star-on' : ''}`}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
            >
              {n <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>
        {errors.rating && <div className="form-error">{errors.rating}</div>}
      </div>

      <FormTextarea
        label="Your review" name="reviewText"
        value={reviewText} onChange={(e) => setReviewText(e.target.value)}
        rows={4} placeholder="Tell other clients about your experience…"
        error={errors.reviewText}
      />

      <button type="submit" className="btn btn-primary rv-submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>

      <style>{`
        .rv-lead { color: var(--color-neutral-600); margin-bottom: var(--space-lg); font-size: var(--font-size-base); }
        .rv-stars { display: flex; gap: 6px; }
        .rv-star {
          background: none; border: none; cursor: pointer; font-size: 2.4rem; line-height: 1;
          color: var(--color-neutral-300); padding: 0;
          transition: color var(--transition-base), transform var(--transition-base);
        }
        .rv-star:hover { transform: scale(1.15); }
        .rv-star-on { color: #f59e0b; filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.35)); }
        .rv-submit { margin-top: var(--space-lg); }
      `}</style>
    </form>
  );
}
