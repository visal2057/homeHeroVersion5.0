import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';

const DISTRICTS = {
  colombo: 'Colombo', gampaha: 'Gampaha', kandy: 'Kandy', galle: 'Galle',
  matara: 'Matara', kurunegala: 'Kurunegala', ratnapura: 'Ratnapura',
  badulla: 'Badulla', anuradhapura: 'Anuradhapura', trincomalee: 'Trincomalee',
  jaffna: 'Jaffna', kalutara: 'Kalutara', kegalle: 'Kegalle',
};

function StarRating({ rating }) {
  const filled = Math.round(rating ?? 0);
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
      {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
      <span style={{ color: 'var(--color-neutral-500)', marginLeft: 4, fontSize: 'var(--font-size-xs)' }}>
        {rating > 0 ? `${Number(rating).toFixed(1)}` : 'New'}
      </span>
    </span>
  );
}

export default function ProviderCard({ provider }) {
  const [hovered, setHovered] = useState(false);
  const profileHref = ROUTES.CLIENT_PROVIDER_PROFILE.replace(':providerId', provider.providerId ?? provider.id);

  return (
    <div
      className="provider-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pc-inner">
        <div className="pc-avatar">
          {provider.profilePhoto
            ? <img src={getAssetUrl(provider.profilePhoto)} alt={provider.name} />
            : <span>{(provider.name ?? 'P')[0].toUpperCase()}</span>}
          {provider.isVerified && <span className="pc-verified" title="Verified">✓</span>}
        </div>
        <div className="pc-body">
          <div className="pc-name">{provider.name}</div>
          <div className="pc-meta">
            <span>📍 {DISTRICTS[provider.district] ?? provider.district ?? 'N/A'}</span>
            <StarRating rating={provider.averageRating ?? provider.rating} />
          </div>
          {provider.bio && <p className="pc-bio">{provider.bio}</p>}
          <div className="pc-footer">
            {provider.hourlyRate && (
              <span className="pc-rate">Rs. {provider.hourlyRate}/hr</span>
            )}
            <Link to={profileHref} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 'var(--font-size-sm)' }}>
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {hovered && provider.workPreview?.length > 0 && (
        <div className="pc-preview animate-fade-in-up">
          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary-700)', marginBottom: 8 }}>Recent Work</div>
          <div className="pc-preview-grid">
            {provider.workPreview.slice(0, 3).map((img, i) => (
              <img key={i} src={img} alt="" />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .provider-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-neutral-200);
          padding: var(--space-lg);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .provider-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .pc-inner { display: flex; gap: var(--space-md); }
        .pc-avatar {
          position: relative; width: 72px; height: 72px; border-radius: 50%;
          overflow: hidden; flex-shrink: 0;
          background: var(--color-primary-100); display: flex; align-items: center;
          justify-content: center; font-size: 1.75rem; font-weight: 700;
          color: var(--color-primary-700); border: 3px solid var(--color-primary-200);
        }
        .pc-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pc-verified {
          position: absolute; bottom: 2px; right: 2px; width: 18px; height: 18px;
          background: var(--color-primary-600); color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; border: 2px solid white;
        }
        .pc-body { flex: 1; min-width: 0; }
        .pc-name { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-secondary-700); margin-bottom: 4px; }
        .pc-meta { display: flex; gap: var(--space-md); flex-wrap: wrap; margin-bottom: 6px; font-size: var(--font-size-sm); color: var(--color-neutral-500); align-items: center; }
        .pc-bio { font-size: var(--font-size-sm); color: var(--color-neutral-600); margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pc-footer { display: flex; align-items: center; justify-content: space-between; }
        .pc-rate { font-weight: 700; color: var(--color-primary-700); font-size: var(--font-size-sm); }
        .pc-preview {
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-neutral-200); padding: var(--space-md);
          z-index: 20; width: 240px; margin-top: 8px;
        }
        .pc-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .pc-preview-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-sm); }
      `}</style>
    </div>
  );
}
