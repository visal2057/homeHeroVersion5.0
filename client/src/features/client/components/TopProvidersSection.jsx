import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';

function StarRating({ rating }) {
  const filled = Math.round(rating ?? 0);
  return <span style={{ color: '#f59e0b' }}>{'★'.repeat(filled)}{'☆'.repeat(5 - filled)}</span>;
}

export default function TopProvidersSection({ providers = [], category }) {
  if (!providers.length) return null;

  return (
    <section className="top-providers-section">
      <div className="tps-header">
        <h2 className="tps-title">⭐ Top Providers in {category}</h2>
        <p className="tps-sub">Highly rated professionals trusted by our community</p>
      </div>
      <div className="tps-grid">
        {providers.slice(0, 5).map((p) => {
          const href = ROUTES.CLIENT_PROVIDER_PROFILE.replace(':providerId', p.providerId ?? p.id);
          return (
            <Link key={p.providerId ?? p.id} to={href} className="tps-card">
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
        .tps-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: 4px; }
        .tps-sub { color: var(--color-neutral-500); }
        .tps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-lg); }
        .tps-card {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: var(--space-lg);
          background: white; border-radius: var(--radius-lg);
          border: 2px solid var(--color-primary-100);
          text-decoration: none; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          gap: 6px;
        }
        .tps-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--color-primary-400); }
        .tps-card::after { display: none; }
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
