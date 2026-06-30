import { IconChatBubble, IconStar } from '../../../components/common/icons.jsx';

function StarRow({ value }) {
  const n = Math.round(value ?? 0);
  return (
    <div className="provider-review-stars" aria-label={`${value} stars`} style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} size={13} style={{ opacity: i < n ? 1 : 0.25 }} />
      ))}
    </div>
  );
}

export default function ProviderReviews({ reviews }) {
  if (!reviews?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconChatBubble size={24} /></div>
        <p className="provider-empty-state-title">No reviews yet</p>
        <p className="provider-empty-state-desc">Client reviews will appear here after jobs are completed.</p>
      </div>
    );
  }

  return (
    <div className="provider-reviews-list">
      {reviews.map((r) => (
        <div key={r.id} className="provider-review-card">
          <div className="provider-review-header">
            <span className="provider-review-author">{r.client_name ?? 'Anonymous'}</span>
            <span className="provider-review-date">
              {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
            </span>
          </div>
          <StarRow value={r.rating} />
          <p className="provider-review-text">{r.comment ?? ''}</p>
        </div>
      ))}
    </div>
  );
}
