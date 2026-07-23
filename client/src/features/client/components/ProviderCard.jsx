import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { IconMapPin, IconStar } from '../../../components/common/icons.jsx';

function ProviderWorkPreview({ preview }) {
  if (!preview?.images?.length) return null;
  return (
    <div className="pc-preview animate-fade-in-up">
      {preview.title && <div className="pc-preview-title">{preview.title}</div>}
      {preview.description && <p className="pc-preview-desc">{preview.description}</p>}
      <div className="pc-preview-grid">
        {preview.images.slice(0, 3).map((img, i) => (
          <img key={i} src={getAssetUrl(img)} alt={preview.title ? `${preview.title} ${i + 1}` : ''} />
        ))}
      </div>
    </div>
  );
}

const DISTRICTS = {
  colombo: 'Colombo', gampaha: 'Gampaha', kandy: 'Kandy', galle: 'Galle',
  matara: 'Matara', kurunegala: 'Kurunegala', ratnapura: 'Ratnapura',
  badulla: 'Badulla', anuradhapura: 'Anuradhapura', trincomalee: 'Trincomalee',
  jaffna: 'Jaffna', kalutara: 'Kalutara', kegalle: 'Kegalle',
};

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
}

function StarRating({ rating }) {
  const filled = Math.round(rating ?? 0);
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar key={i} size={12} style={{ color: i < filled ? '#f59e0b' : 'var(--color-neutral-200)' }} />
      ))}
      <span style={{ color: 'var(--color-neutral-500)', marginLeft: 4, fontSize: 'var(--font-size-xs)' }}>
        {(rating ?? 0) > 0 ? Number(rating).toFixed(1) : 'New'}
      </span>
    </span>
  );
}

export default function ProviderCard({ provider }) {
  const [hovered, setHovered] = useState(false);
  const profileHref = ROUTES.CLIENT_PROVIDER_PROFILE.replace(':providerId', provider.providerId ?? provider.id);

  const hasPreview = provider.workPreview?.images?.length > 0;

  return (
    <div
      className={`provider-card${hasPreview ? ' has-preview' : ''}`}
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <IconMapPin size={12} style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
              {DISTRICTS[provider.district] ?? provider.district ?? 'N/A'}
            </span>
            <StarRating rating={provider.averageRating ?? provider.rating} />
          </div>
          {provider.bio && <p className="pc-bio">{provider.bio}</p>}
          {provider.unavailableFrom && provider.unavailableTo && (
            <div className="pc-unavailable">
              Unavailable {formatShortDate(provider.unavailableFrom)} – {formatShortDate(provider.unavailableTo)}
            </div>
          )}
          <div className="pc-footer">
            {provider.hourlyRate && (
              <span className="pc-rate">Rs. {provider.hourlyRate}/hr</span>
            )}
            <Link to={profileHref} className="btn btn-primary" style={{ padding: '7px 17px', fontSize: 'var(--font-size-sm)' }}>
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {hovered && hasPreview && <ProviderWorkPreview preview={provider.workPreview} />}

      <style>{`
        .provider-card {
          background: white; border-radius: var(--radius-lg);
          border: 1px solid var(--color-neutral-200); padding: var(--space-lg);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease; position: relative;
          z-index: 1;
        }
        .provider-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); z-index: 25; }
        /* Dims every other card in the grid while one card's work preview is
           open, without touching the hovered card itself - so it (and its
           "View Profile" link) always stays sharp and clickable, no matter
           where it sits in the DOM or what wraps it. Pure sibling selectors,
           so this works for any grid of provider cards, present or future,
           with no coordination needed from the page that renders them. */
        .provider-card:has(~ .provider-card.has-preview:hover),
        .provider-card.has-preview:hover ~ .provider-card {
          filter: blur(3px);
        }
        .pc-inner { display: flex; gap: var(--space-md); }
        .pc-avatar {
          position: relative; width: 86px; height: 86px; border-radius: 50%;
          overflow: hidden; flex-shrink: 0; background: var(--color-primary-100);
          display: flex; align-items: center; justify-content: center;
          font-size: 2.1rem; font-weight: 700; color: var(--color-primary-700);
          border: 3px solid var(--color-primary-200);
        }
        .pc-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pc-verified {
          position: absolute; bottom: 2px; right: 2px; width: 22px; height: 22px;
          background: var(--color-primary-600); color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; border: 2px solid white;
        }
        .pc-body { flex: 1; min-width: 0; }
        .pc-name { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-secondary-700); margin-bottom: 4px; }
        .pc-meta { display: flex; gap: var(--space-md); flex-wrap: wrap; margin-bottom: 6px; font-size: var(--font-size-sm); color: var(--color-neutral-500); align-items: center; }
        .pc-bio { font-size: var(--font-size-sm); color: var(--color-neutral-600); margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pc-unavailable {
          display: inline-block; font-size: var(--font-size-xs); font-weight: 600;
          color: #b45309; background: #fef3c7; border-radius: var(--radius-sm);
          padding: 3px 8px; margin-bottom: 8px;
        }
        .pc-footer { display: flex; align-items: center; justify-content: space-between; }
        .pc-rate { font-weight: 700; color: var(--color-primary-700); font-size: var(--font-size-sm); }
        .pc-preview {
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-neutral-200); padding: var(--space-md);
          z-index: 20; width: 288px; margin-top: 8px;
        }
        .pc-preview-title { font-weight: 600; font-size: var(--font-size-sm); color: var(--color-secondary-700); margin-bottom: 4px; }
        .pc-preview-desc {
          font-size: var(--font-size-xs); color: var(--color-neutral-500); margin: 0 0 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .pc-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
        .pc-preview-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-sm); }
      `}</style>
    </div>
  );
}
