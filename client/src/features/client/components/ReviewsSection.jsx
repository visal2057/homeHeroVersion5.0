import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

function WriteReviewButton({ reviewEligibility }) {
  const [showReason, setShowReason] = useState(false);
  if (!reviewEligibility) return null;

  if (reviewEligibility.eligible) {
    return (
      <Link
        to={ROUTES.CLIENT_BOOKING_REVIEW.replace(':bookingId', reviewEligibility.bookingId)}
        className="btn btn-outline write-review-btn"
      >
        Write Review
      </Link>
    );
  }

  return (
    <div className="write-review-ineligible">
      <button type="button" className="btn btn-outline write-review-btn" onClick={() => setShowReason((s) => !s)}>
        Write Review
      </button>
      {showReason && (
        <p className="write-review-reason">
          You can write a review once you have a completed booking with this provider that hasn&apos;t been reviewed yet.
        </p>
      )}
    </div>
  );
}

function StarRating({ rating }) {
  const filled = Math.round(rating ?? 0);
  return <span style={{ color: '#f59e0b' }}>{'★'.repeat(filled)}{'☆'.repeat(5 - filled)}</span>;
}

function ReviewCard({ review }) {
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const initials = (review.clientName ?? 'C')[0].toUpperCase();
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-avatar">{initials}</div>
        <div>
          <div className="review-author">{review.clientName ?? 'Anonymous'}</div>
          <div className="review-date">{date}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StarRating rating={review.rating} />
        </div>
      </div>
      {review.comment && <p className="review-comment">{review.comment}</p>}
    </div>
  );
}

export default function ReviewsSection({ reviews = [], averageRating, reviewCount, reviewEligibility }) {
  return (
    <div>
      {!reviews.length ? (
        <div className="reviews-empty">
          <span>💬</span>
          <p>No reviews yet. Be the first to book this provider!</p>
          <WriteReviewButton reviewEligibility={reviewEligibility} />
        </div>
      ) : (
        <>
          <div className="reviews-summary">
            <span className="reviews-avg">{Number(averageRating ?? 0).toFixed(1)}</span>
            <div>
              <StarRating rating={averageRating} />
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: 2 }}>
                Based on {reviewCount ?? reviews.length} reviews
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <WriteReviewButton reviewEligibility={reviewEligibility} />
            </div>
          </div>
          <div className="reviews-list">
            {reviews.map((r, i) => <ReviewCard key={r.id ?? i} review={r} />)}
          </div>
        </>
      )}

      <style>{`
        .reviews-summary {
          display: flex; align-items: center; gap: var(--space-lg);
          background: var(--color-primary-50); border-radius: var(--radius-lg);
          padding: var(--space-lg); margin-bottom: var(--space-xl);
        }
        .reviews-avg { font-size: 3.6rem; font-weight: 800; color: var(--color-primary-700); }
        .reviews-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .review-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-md); padding: var(--space-lg);
        }
        .review-header { display: flex; gap: var(--space-md); align-items: center; margin-bottom: 12px; }
        .review-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--color-primary-600); color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--font-size-sm); flex-shrink: 0;
        }
        .review-author { font-weight: 600; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .review-date { color: var(--color-neutral-400); font-size: var(--font-size-xs); }
        .review-comment { color: var(--color-neutral-700); margin: 0; }
        .reviews-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); }
        .reviews-empty span { font-size: 2.4rem; }
        .write-review-btn { white-space: nowrap; margin-top: var(--space-md); }
        .reviews-summary .write-review-btn { margin-top: 0; }
        .write-review-ineligible { display: inline-block; text-align: left; }
        .write-review-reason {
          margin: 8px 0 0; font-size: var(--font-size-xs); color: var(--color-neutral-500);
          max-width: 260px;
        }
      `}</style>
    </div>
  );
}
