import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { IconMapPin, IconToolbox, IconCalendar, IconStar } from '../../../components/common/icons.jsx';

const CATEGORY_IMAGES = {
  gardening:  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=80',
  cleaning:   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000&q=80',
  'pet-care': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=2000&q=80',
  plumbing:   'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=2000&q=80',
  'ac-repair':'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=2000&q=80',
};
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80';

function getBannerImage(category) {
  if (!category) return DEFAULT_BANNER;
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_IMAGES[key] ?? DEFAULT_BANNER;
}

const DISTRICTS = {
  colombo: 'Colombo', gampaha: 'Gampaha', kandy: 'Kandy', galle: 'Galle',
  matara: 'Matara', kurunegala: 'Kurunegala', ratnapura: 'Ratnapura',
};

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StarRating({ rating, count }) {
  const filled = Math.round(rating ?? 0);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <IconStar
            key={i}
            size={21}
            style={{
              color: i < filled ? '#f59e0b' : 'rgba(255,255,255,0.35)',
              // Gives the flat SVG glyph a bit of 2D depth - a soft cast
              // shadow beneath it, like a small enamel/glass star charm,
              // rather than a plain flat-colored shape.
              filter: i < filled ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.35))' : 'none',
            }}
          />
        ))}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-sm)' }}>
        {rating > 0 ? `${Number(rating).toFixed(1)} (${count ?? 0})` : 'No reviews yet'}
      </span>
    </span>
  );
}

export default function ProviderProfileHeader({ provider, canBook = true }) {
  const { user } = useAuth();
  const location = useLocation();
  // A logged-out visitor can browse all the way to a provider's profile
  // (see ProtectedRoute's `allowGuest`), but only gets sent into the actual
  // booking flow once logged in as a Client - "Book Now" sends them to
  // client signup instead. This profile page's own location is carried
  // along as router state so that, once they register and log in, they
  // land straight back on this exact provider's profile instead of the
  // generic homepage (LoginForm already honors `location.state.from`).
  const bookingHref = user
    ? ROUTES.CLIENT_BOOKING_CONFIRM.replace(':providerId', provider.providerId ?? provider.id)
    : ROUTES.REGISTER_CLIENT;
  const bookingState = user ? undefined : { from: location };
  const bannerImage = getBannerImage(provider.category);
  const districtLabel = DISTRICTS[provider.district?.toLowerCase()] ?? provider.district;

  return (
    <div className="pph-wrap">
      {/* Category-matched banner */}
      <div className="pph-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="pph-banner-overlay" />
      </div>

      {/* Full-bleed green band - the container inside it just keeps the
          actual content (avatar/info/CTA) aligned to the page's usual
          content column, same as everywhere else. */}
      <div className="pph-meta-band">
        <div className="container">
          <div className="pph-card">
            {/* Avatar overlapping banner */}
            <div className="pph-avatar-wrap">
              <div className="pph-avatar">
                {provider.profilePhoto
                  ? <img src={getAssetUrl(provider.profilePhoto)} alt={provider.name} />
                  : <span>{(provider.name ?? 'P')[0].toUpperCase()}</span>}
              </div>
              {provider.isVerified && (
                <span className="pph-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Verified
                </span>
              )}
            </div>

            {/* Info */}
            <div className="pph-info">
              <h1 className="pph-name">{provider.name}</h1>
              <div className="pph-meta">
                {districtLabel && (
                  <span className="pph-meta-item">
                    <IconMapPin size={16} style={{ color: 'var(--color-neutral-0)' }} />
                    {districtLabel}
                  </span>
                )}
                {provider.category && (
                  <span className="pph-meta-item">
                    <IconToolbox size={16} style={{ color: 'var(--color-neutral-0)' }} />
                    {provider.category}
                  </span>
                )}
                {provider.hourlyRate && (
                  <span className="pph-meta-item">
                    Rs. {provider.hourlyRate}/hr
                  </span>
                )}
              </div>
              <StarRating rating={provider.averageRating} count={provider.reviewCount} />
              {provider.unavailablePeriods?.[0] && (
                <div className="pph-unavailable-notice">
                  Unavailable {formatShortDate(provider.unavailablePeriods[0].startDate)} – {formatShortDate(provider.unavailablePeriods[0].endDate)}
                </div>
              )}
            </div>

            {/* CTA - hidden entirely for a viewer who isn't allowed to book
                (e.g. a pending Service Provider browsing profiles) */}
            <div className="pph-actions">
              {provider.isAvailable !== false ? (
                canBook && (
                  <Link
                    to={bookingHref}
                    state={bookingState}
                    className="btn btn-primary btn-shine pph-book-btn"
                    style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
                  >
                    <IconCalendar size={19} style={{ marginRight: 6 }} />
                    Book Now
                  </Link>
                )
              ) : (
                <span className="pph-unavailable">Currently Unavailable</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pph-wrap { background: white; border-bottom: 1px solid var(--color-neutral-200); }
        .pph-banner {
          height: 240px; background-size: cover; background-position: center;
          position: relative;
        }
        .pph-banner-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(15,45,25,0.52) 0%, rgba(21,128,61,0.35) 100%);
        }
        /* Full-bleed: spans edge-to-edge regardless of the page's max-width
           content column, same as .pph-banner above it. */
        .pph-meta-band {
          background: linear-gradient(120deg, var(--color-secondary-700) 0%, var(--color-primary-600) 100%);
          box-shadow: 0 16px 36px rgba(5, 150, 105, 0.18);
        }
        .pph-card {
          display: flex; gap: var(--space-xl); align-items: center;
          padding: 0 0 var(--space-xl);
        }
        .pph-avatar-wrap { position: relative; margin-top: -74px; flex-shrink: 0; }
        .pph-avatar {
          width: 156px; height: 156px; border-radius: 50%;
          border: 4px solid white; box-shadow: 0 10px 28px rgba(0,0,0,0.22);
          background: var(--color-primary-100); overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-size: 3.4rem; font-weight: 700; color: var(--color-primary-700);
        }
        .pph-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pph-badge {
          position: absolute; bottom: 4px; right: 4px;
          background: var(--color-primary-600); color: white;
          font-size: 12px; font-weight: 700; padding: 2px 8px;
          border-radius: var(--radius-full); border: 2px solid white;
          display: flex; align-items: center; gap: 3px;
        }
        .pph-info { flex: 1; padding-top: 8px; min-width: 0; }
        .pph-name {
          font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-neutral-0);
          margin-bottom: 8px; overflow-wrap: break-word; text-transform: capitalize;
          text-shadow: 0 2px 10px rgba(3, 42, 32, 0.35);
        }
        .pph-meta { display: flex; gap: var(--space-md); flex-wrap: wrap; margin-bottom: 10px; }
        .pph-meta-item { display: flex; align-items: center; gap: 5px; font-size: var(--font-size-sm); color: var(--color-neutral-0); }
        .pph-unavailable-notice {
          display: inline-block; margin-top: 8px; font-size: var(--font-size-sm); font-weight: 600;
          color: #b45309; background: #fef3c7; border-radius: var(--radius-sm); padding: 4px 10px;
        }
        .pph-actions { flex-shrink: 0; }
        .pph-book-btn {
          display: flex; align-items: center; padding: 14px 34px; font-size: var(--font-size-base);
          box-shadow: 0 10px 28px rgba(0,0,0,0.18);
        }
        .pph-unavailable { padding: 12px 24px; border-radius: var(--radius-md); background: var(--color-neutral-100); color: var(--color-neutral-500); font-size: var(--font-size-sm); font-weight: 600; }
        @media (max-width: 640px) {
          .pph-card { flex-wrap: wrap; }
          .pph-actions { width: 100%; }
          .pph-book-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
