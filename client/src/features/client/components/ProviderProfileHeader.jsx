import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';

const DISTRICTS = {
  colombo: 'Colombo', gampaha: 'Gampaha', kandy: 'Kandy', galle: 'Galle',
  matara: 'Matara', kurunegala: 'Kurunegala', ratnapura: 'Ratnapura',
};

function StarRating({ rating, count }) {
  const filled = Math.round(rating ?? 0);
  return (
    <span>
      <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{'★'.repeat(filled)}{'☆'.repeat(5 - filled)}</span>
      <span style={{ marginLeft: 8, color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
        {rating > 0 ? `${Number(rating).toFixed(1)} (${count ?? 0} reviews)` : 'No reviews yet'}
      </span>
    </span>
  );
}

export default function ProviderProfileHeader({ provider }) {
  const bookingHref = ROUTES.CLIENT_BOOKING_CONFIRM.replace(':providerId', provider.providerId ?? provider.id);

  return (
    <div className="pph-wrap">
      <div className="pph-banner" />
      <div className="container">
        <div className="pph-card">
          <div className="pph-avatar-wrap">
            <div className="pph-avatar">
              {provider.profilePhoto
                ? <img src={getAssetUrl(provider.profilePhoto)} alt={provider.name} />
                : <span>{(provider.name ?? 'P')[0].toUpperCase()}</span>}
            </div>
            {provider.isVerified && (
              <span className="pph-badge">✓ Verified</span>
            )}
          </div>
          <div className="pph-info">
            <h1 className="pph-name">{provider.name}</h1>
            <div className="pph-meta">
              <span>📍 {DISTRICTS[provider.district] ?? provider.district}</span>
              {provider.category && <span>🛠️ {provider.category}</span>}
              {provider.hourlyRate && <span>💰 Rs. {provider.hourlyRate}/hr</span>}
            </div>
            <StarRating rating={provider.averageRating} count={provider.reviewCount} />
            {provider.bio && <p className="pph-bio">{provider.bio}</p>}
          </div>
          <div className="pph-actions">
            <Link to={bookingHref} className="btn btn-primary btn-shine pph-book-btn">
              Book Now
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .pph-wrap { background: white; border-bottom: 1px solid var(--color-neutral-200); }
        .pph-banner {
          height: 160px;
          background: linear-gradient(135deg, var(--color-secondary-700) 0%, var(--color-primary-600) 100%);
        }
        .pph-card {
          display: flex; gap: var(--space-xl); align-items: flex-end;
          padding: 0 0 var(--space-xl);
          flex-wrap: wrap;
        }
        .pph-avatar-wrap {
          position: relative; margin-top: -50px; flex-shrink: 0;
        }
        .pph-avatar {
          width: 120px; height: 120px; border-radius: 50%;
          border: 4px solid white; box-shadow: var(--shadow-md);
          background: var(--color-primary-100); overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; font-weight: 700; color: var(--color-primary-700);
        }
        .pph-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pph-badge {
          position: absolute; bottom: 4px; right: 4px;
          background: var(--color-primary-600); color: white;
          font-size: 11px; font-weight: 600; padding: 2px 8px;
          border-radius: var(--radius-full); border: 2px solid white;
        }
        .pph-info { flex: 1; padding-bottom: 4px; }
        .pph-name { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-secondary-700); margin-bottom: 8px; }
        .pph-meta { display: flex; gap: var(--space-lg); flex-wrap: wrap; font-size: var(--font-size-sm); color: var(--color-neutral-500); margin-bottom: 8px; }
        .pph-bio { color: var(--color-neutral-600); margin-top: 10px; max-width: 600px; }
        .pph-actions { padding-bottom: 4px; }
        .pph-book-btn { padding: 12px 32px; font-size: var(--font-size-lg); }
      `}</style>
    </div>
  );
}
