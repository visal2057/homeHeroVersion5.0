import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { IconMapPin, IconStar } from '../../../components/common/icons.jsx';

// The "All Providers" hover-preview popup (system flow section 13.4): shows
// up to the provider's five most recent portfolio posts, most recent first,
// scrollable so all five stay reachable without growing the popup without
// bound.
function ProviderWorkPreview({ posts }) {
  if (!posts?.length) return null;
  return (
    <div className="pc-preview animate-fade-in-up">
      <div className="pc-preview-header">Previous Work</div>
      <div className="pc-preview-scroll">
        {posts.slice(0, 5).map((post, idx) => (
          <div className="pc-preview-post" key={idx}>
            {post.title && <div className="pc-preview-title">{post.title}</div>}
            {post.description && <p className="pc-preview-desc">{post.description}</p>}
            {post.images?.length > 0 && (
              <div className="pc-preview-grid">
                {post.images.slice(0, 3).map((img, i) => (
                  <img key={i} src={getAssetUrl(img)} alt={post.title ? `${post.title} ${i + 1}` : ''} />
                ))}
              </div>
            )}
          </div>
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

  const hasPreview = provider.workPreview?.posts?.length > 0;

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

      {hovered && hasPreview && <ProviderWorkPreview posts={provider.workPreview.posts} />}

      <style>{`
        .provider-card {
          background: white; border-radius: var(--radius-lg);
          border: 1px solid var(--color-neutral-200); padding: var(--space-lg);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease; position: relative;
          z-index: 1;
        }
        .provider-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); z-index: 25; }
        /* System flow section 13.4: "the Explore page background becomes
           blurred" while a card's work preview is open - the whole page,
           not just its neighbors in the grid. Each region (header, hero,
           top-providers, filters, results count, other cards) is blurred
           individually by name rather than by wrapping the page in one
           blurred container, because filter has no "exclude this nested
           descendant" mechanism - a parent-level blur would blur the
           hovered card too, since it's a descendant of everything here.
           Scoped from body via :has() so this rule can only ever match on
           an Explore page (.provider-card only renders there) and needs no
           fixed positioning, portal, or z-index racing against anything -
           the exact approach a full-page overlay in this file's history
           broke on (see "Fix provider cards with a work preview becoming
           unclickable on hover" / "Remove the fixed-overlay/portal
           hover-blur mechanism" in git log). The hovered card and its
           popup are never matched by any selector below, so they're
           excluded by construction and stay sharp and fully clickable. */
        body:has(.provider-card.has-preview:hover)
          :is(header, footer, .ep-hero, .top-providers-section, .ep-filters, .ep-results-header, .provider-card:not(:hover)) {
          filter: blur(3px);
          transition: filter 0.2s ease;
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
        .pc-preview-header {
          font-weight: 700; font-size: var(--font-size-xs); text-transform: uppercase;
          letter-spacing: 0.04em; color: var(--color-neutral-400); margin-bottom: 8px;
        }
        /* Up to 5 posts (system flow 13.4), scrollable instead of growing
           the popup without bound. */
        .pc-preview-scroll { max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-sm); }
        .pc-preview-post + .pc-preview-post { padding-top: var(--space-sm); border-top: 1px solid var(--color-neutral-100); }
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
