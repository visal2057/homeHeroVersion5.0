import { getAssetUrl } from '../../../../utils/storageUtils.js';
import { IconTrophy, IconStar } from '../../../../components/common/icons.jsx';

function StarRating({ rating }) {
  const filled = Math.round(rating ?? 0);
  return (
    <span className="mvp-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar key={i} size={11} style={{ color: i < filled ? '#f59e0b' : 'var(--color-neutral-200)' }} />
      ))}
    </span>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <div className="mvp-rank-badge mvp-rank-1">
        <IconTrophy size={13} />
      </div>
    );
  }
  const tierClass = rank === 2 ? ' mvp-rank-2' : rank === 3 ? ' mvp-rank-3' : '';
  return <div className={`mvp-rank-badge${tierClass}`}>#{rank}</div>;
}

export default function MvpProvidersSection({ providers = [], isLoading }) {
  return (
    <section className="mvp-section animate-fade-in-up">
      <div className="mvp-header">
        <div className="mvp-trophy-wrap">
          <IconTrophy size={24} />
        </div>
        <div>
          <h2 className="mvp-title">MVP Providers</h2>
          <p className="mvp-sub">Top 10 Service Providers system-wide, ranked by completed jobs across all 5 categories</p>
        </div>
        <span className="mvp-live-pill">
          <span className="mvp-live-dot" aria-hidden="true" />
          Live
        </span>
      </div>

      {isLoading && providers.length === 0 ? (
        <p className="empty-state">Loading leaderboard...</p>
      ) : providers.length === 0 ? (
        <p className="empty-state">No completed jobs recorded yet.</p>
      ) : (
        <div className="mvp-grid">
          {providers.map((provider, index) => {
            const rank = index + 1;
            return (
              <div key={provider.providerUserId} className={`mvp-card${rank === 1 ? ' mvp-card-first' : ''}`}>
                <RankBadge rank={rank} />
                <div className="mvp-avatar">
                  {provider.profileImageUrl
                    ? <img src={getAssetUrl(provider.profileImageUrl)} alt={provider.fullName} />
                    : <span>{(provider.fullName ?? 'P')[0]}</span>}
                </div>
                <div className="mvp-name">{provider.fullName}</div>
                <div className="mvp-token">{provider.userToken}</div>
                <div className="mvp-categories">
                  {provider.categories.map((category) => (
                    <span key={category} className="mvp-category-tag">{category}</span>
                  ))}
                </div>
                <div className="mvp-jobs-count">{provider.completedJobCount}</div>
                <div className="mvp-jobs-label">completed jobs</div>
                <StarRating rating={provider.averageRating} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
