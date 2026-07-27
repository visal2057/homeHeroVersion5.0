import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { IconStar, IconChatBubble } from '../../../components/common/icons.jsx';

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
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar
          key={i}
          size={16}
          style={{ color: i < filled ? '#f59e0b' : 'var(--color-neutral-300)' }}
        />
      ))}
    </span>
  );
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
          <span className="reviews-empty-icon"><IconChatBubble size={26} /></span>
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
          background: linear-gradient(135deg, var(--color-primary-50), var(--color-neutral-0));
          border: 1px solid var(--color-primary-100); border-radius: var(--radius-lg);
          padding: var(--space-lg); margin-bottom: var(--space-xl); box-shadow: var(--shadow-sm);
        }
        .reviews-avg { font-size: 3.6rem; font-weight: 800; color: var(--color-primary-700); }
        .reviews-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .review-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-md); padding: var(--space-lg); box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition-base), transform var(--transition-base);
        }
        .review-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .review-header { display: flex; gap: var(--space-md); align-items: center; margin-bottom: 12px; }
        .review-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-700)); color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--font-size-sm); flex-shrink: 0;
        }
        .review-author { font-weight: 600; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .review-date { color: var(--color-neutral-400); font-size: var(--font-size-xs); }
        .review-comment { color: var(--color-neutral-700); margin: 0; }
        .reviews-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); }
        .reviews-empty-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 64px; height: 64px; border-radius: 50%; margin-bottom: var(--space-sm);
          background: var(--color-neutral-100); color: var(--color-neutral-400);
        }
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
