import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { IconTrophy, IconStar } from '../../../components/common/icons.jsx';

function StarRating({ rating }) {
  const filled = Math.round(rating ?? 0);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar
          key={i}
          size={12}
          style={{ color: i < filled ? '#f59e0b' : 'var(--color-neutral-200)' }}
        />
      ))}
    </span>
  );
}

export default function TopProvidersSection({ providers = [], category }) {
  if (!providers.length) return null;

  return (
    <section className="top-providers-section">
      <div className="tps-header">
        <div className="tps-header-left">
          <div className="tps-trophy-wrap">
            <IconTrophy size={22} style={{ color: '#d97706' }} />
          </div>
          <div>
            <h2 className="tps-title">Top Providers in {category}</h2>
            <p className="tps-sub">Highly rated professionals trusted by our community</p>
          </div>
        </div>
      </div>
      <div className="tps-grid">
        {providers.slice(0, 5).map((p, idx) => {
          const href = ROUTES.CLIENT_PROVIDER_PROFILE.replace(':providerId', p.providerId ?? p.id);
          return (
            <Link key={p.providerId ?? p.id} to={href} className={`tps-card${idx === 0 ? ' tps-card-first' : ''}`}>
              {idx === 0 && (
                <div className="tps-rank-badge tps-rank-1">
                  <IconTrophy size={12} style={{ color: '#d97706' }} />
                </div>
              )}
              {idx > 0 && <div className="tps-rank-badge">#{idx + 1}</div>}
              <div className="tps-avatar">
                {p.profilePhoto
                  ? <img src={getAssetUrl(p.profilePhoto)} alt={p.name} />
                  : <span>{(p.name ?? 'P')[0]}</span>}
                {p.isVerified && <span className="tps-badge">✓</span>}
              </div>
              <div className="tps-name">{p.name}</div>
              <StarRating rating={p.averageRating} />
              <div className="tps-reviews">{p.reviewCount ?? 0} reviews</div>
              {p.hourlyRate && <div className="tps-rate">Rs. {p.hourlyRate}/hr</div>}
            </Link>
          );
        })}
      </div>

      <style>{`
        .top-providers-section { margin-bottom: var(--space-2xl); }
        .tps-header { margin-bottom: var(--space-xl); }
        .tps-header-left { display: flex; align-items: center; gap: var(--space-md); }
        .tps-trophy-wrap {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          background: #fffbeb; border: 1px solid #fde68a;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .tps-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: 4px; font-weight: 700; }
        .tps-sub { color: var(--color-neutral-500); font-size: var(--font-size-sm); margin: 0; }
        .tps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-lg); }
        .tps-card {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: var(--space-lg);
          background: white; border-radius: var(--radius-lg);
          border: 2px solid var(--color-primary-100);
          text-decoration: none; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          gap: 6px; position: relative;
        }
        .tps-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--color-primary-400); }
        .tps-card::after { display: none; }
        .tps-card-first { border-color: #fde68a; background: linear-gradient(160deg, #fffbeb 0%, white 60%); }
        .tps-card-first:hover { border-color: #d97706; }
        .tps-rank-badge {
          position: absolute; top: 10px; right: 10px;
          background: var(--color-neutral-100); color: var(--color-neutral-500);
          font-size: 10px; font-weight: 700; padding: 2px 7px;
          border-radius: var(--radius-full);
        }
        .tps-rank-1 { background: #fffbeb; color: #d97706; padding: 4px 7px; }
        .tps-avatar {
          position: relative; width: 80px; height: 80px; border-radius: 50%;
          background: var(--color-primary-100); overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; font-weight: 700; color: var(--color-primary-700);
          border: 3px solid var(--color-primary-200);
        }
        .tps-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .tps-badge {
          position: absolute; bottom: 2px; right: 2px; width: 18px; height: 18px;
          background: var(--color-primary-600); color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; border: 2px solid white;
        }
        .tps-name { font-weight: 700; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .tps-reviews { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
        .tps-rate { font-weight: 700; color: var(--color-primary-600); font-size: var(--font-size-xs); }
      `}</style>
    </section>
  );
}
