import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { clientApi } from '../clientApi.js';
import ProviderProfileHeader from '../components/ProviderProfileHeader.jsx';
import PreviousWorkGallery from '../components/PreviousWorkGallery.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import {
  IconToolbox, IconMapPin, IconDollarSign, IconCalendar,
  IconShield, IconUser, IconStar,
} from '../../../components/common/icons.jsx';

const MOCK_PROVIDER = {
  id: 'mock-1', providerId: 'mock-1',
  name: 'Nimal Perera', category: 'Gardening', district: 'colombo',
  hourlyRate: 1500,
  bio: 'Experienced gardening professional with over 10 years in lawn care, pruning, and landscape design. Served over 200+ happy clients across Colombo and Gampaha districts.',
  isVerified: true, isAvailable: true, averageRating: 4.8, reviewCount: 42,
  workImages: [], providerToken: 'NPR4X2',
};

const MOCK_REVIEWS = [
  { id: 1, clientName: 'Dilini Fernando', rating: 5, comment: 'Excellent work! My garden looks amazing.', createdAt: '2025-12-15' },
  { id: 2, clientName: 'Kasun Jayawardena', rating: 4, comment: 'Very professional and on time. Will book again.', createdAt: '2025-11-28' },
  { id: 3, clientName: 'Priya Wickramasinghe', rating: 5, comment: 'Best gardener in the area, highly recommended!', createdAt: '2025-11-10' },
];

const CATEGORY_CTA_IMAGES = {
  gardening:  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=80',
  cleaning:   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000&q=80',
  'pet-care': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=2000&q=80',
  plumbing:   'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=2000&q=80',
  'ac-repair':'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=2000&q=80',
};
const DEFAULT_CTA_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80';

function getCategoryImage(category) {
  if (!category) return DEFAULT_CTA_IMAGE;
  return CATEGORY_CTA_IMAGES[category.toLowerCase().replace(/\s+/g, '-')] ?? DEFAULT_CTA_IMAGE;
}

export default function ProviderPublicProfilePage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          clientApi.getProviderProfile(providerId),
          clientApi.getProviderReviews(providerId),
        ]);
        setProvider(pRes.data?.data ?? pRes.data);
        setReviews(rRes.data?.data ?? rRes.data ?? []);
      } catch {
        setProvider({ ...MOCK_PROVIDER, id: providerId, providerId });
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [providerId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="ep-spinner" />
        <style>{`.ep-spinner { border: 3px solid var(--color-neutral-200); border-top-color: var(--color-primary-500); border-radius: 50%; width: 48px; height: 48px; animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <h2>Provider not found</h2>
        <Link to={ROUTES.HOME} className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Back to Home</Link>
      </div>
    );
  }

  const token = provider.providerToken ?? provider.userToken ?? provider.token;
  const bookingHref = ROUTES.CLIENT_BOOKING_CONFIRM.replace(':providerId', provider.providerId ?? provider.id);
  const ctaImage = getCategoryImage(provider.category);

  const tabs = [
    { key: 'about',   label: 'About' },
    { key: 'gallery', label: `Previous Work (${provider.workImages?.length ?? 0})` },
    { key: 'reviews', label: `Reviews (${provider.reviewCount ?? reviews.length})` },
  ];

  return (
    <div className="pp-page">
      {/* Header: banner + avatar row + Book Now — all in one line */}
      <ProviderProfileHeader provider={provider} />

      <div className="container pp-body">
        {/* Two-column layout: tabs left, service details right */}
        <div className="pp-layout">

          {/* LEFT: tab bar + content */}
          <div className="pp-left">
            <div className="pp-tabs">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`pp-tab${activeTab === t.key ? ' pp-tab-active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="pp-tab-content">
              {activeTab === 'about' && (
                <div className="pp-card">
                  <h3 className="pp-card-title">About {provider.name}</h3>
                  <p style={{ color: 'var(--color-neutral-600)', lineHeight: 1.8, margin: 0 }}>
                    {provider.bio ?? 'No bio provided.'}
                  </p>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="pp-card">
                  <h3 className="pp-card-title">Previous Work</h3>
                  {(provider.workImages?.length ?? 0) === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-neutral-400)' }}>
                      <IconToolbox size={40} style={{ color: 'var(--color-neutral-300)', marginBottom: 12 }} />
                      <p>No portfolio images yet.</p>
                    </div>
                  ) : (
                    <PreviousWorkGallery images={provider.workImages} />
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="pp-card">
                  <h3 className="pp-card-title">Client Reviews</h3>
                  <ReviewsSection
                    reviews={reviews}
                    averageRating={provider.averageRating}
                    reviewCount={provider.reviewCount}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: service details (sticky) */}
          <div className="pp-right">
            <div className="pp-card pp-sticky">
              <h3 className="pp-card-title">Service Details</h3>
              <div className="pp-detail-list">
                {token && (
                  <div className="pp-detail-item">
                    <span className="pp-detail-label">
                      <IconUser size={14} style={{ color: 'var(--color-neutral-400)' }} />
                      Provider Token
                    </span>
                    <span className="pp-detail-value pp-token">{token}</span>
                  </div>
                )}
                <div className="pp-detail-item">
                  <span className="pp-detail-label">
                    <IconToolbox size={14} style={{ color: 'var(--color-neutral-400)' }} />
                    Category
                  </span>
                  <span className="pp-detail-value">{provider.category ?? 'N/A'}</span>
                </div>
                <div className="pp-detail-item">
                  <span className="pp-detail-label">
                    <IconMapPin size={14} style={{ color: 'var(--color-neutral-400)' }} />
                    District
                  </span>
                  <span className="pp-detail-value" style={{ textTransform: 'capitalize' }}>
                    {provider.district ?? 'N/A'}
                  </span>
                </div>
                {provider.hourlyRate && (
                  <div className="pp-detail-item">
                    <span className="pp-detail-label">
                      <IconDollarSign size={14} style={{ color: 'var(--color-neutral-400)' }} />
                      Hourly Rate
                    </span>
                    <span className="pp-detail-value">Rs. {provider.hourlyRate}/hr</span>
                  </div>
                )}
                <div className="pp-detail-item">
                  <span className="pp-detail-label">
                    <IconShield size={14} style={{ color: 'var(--color-neutral-400)' }} />
                    Verified
                  </span>
                  <span className={`pp-detail-value pp-verified-chip ${provider.isVerified ? 'pp-verified-yes' : 'pp-verified-no'}`}>
                    {provider.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                {provider.averageRating > 0 && (
                  <div className="pp-detail-item">
                    <span className="pp-detail-label">
                      <IconStar size={14} style={{ color: 'var(--color-neutral-400)' }} />
                      Rating
                    </span>
                    <span className="pp-detail-value" style={{ color: '#d97706', fontWeight: 700 }}>
                      {Number(provider.averageRating).toFixed(1)} / 5.0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Ready to Book — category image + glassmorphism card */}
        {provider.isAvailable !== false && (
          <div className="pp-cta-section" style={{ backgroundImage: `url(${ctaImage})` }}>
            <div className="pp-cta-overlay" />
            <div className="pp-cta-inner">
              <div className="pp-cta-glass">
                <IconCalendar size={32} style={{ color: 'white', marginBottom: 12 }} />
                <h2 className="pp-cta-title">Ready to Book {provider.name}?</h2>
                <p className="pp-cta-text">
                  {provider.name} is currently accepting bookings.
                  Send your request and get a response within 24 hours.
                </p>
                <Link to={bookingHref} className="pp-cta-btn btn btn-shine">
                  Book This Provider
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pp-page { padding-bottom: 0; }
        .pp-body { padding-top: var(--space-xl); padding-bottom: var(--space-2xl); }

        /* Two-column layout */
        .pp-layout {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: var(--space-xl);
          align-items: start;
          margin-bottom: var(--space-xl);
        }
        @media (max-width: 768px) { .pp-layout { grid-template-columns: 1fr; } }

        /* Tabs */
        .pp-tabs {
          display: flex; gap: 0; border-bottom: 2px solid var(--color-neutral-200);
          margin-bottom: var(--space-lg);
        }
        .pp-tab {
          padding: 11px 22px; background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: var(--font-size-sm); font-weight: 600;
          color: var(--color-neutral-500); border-bottom: 2px solid transparent;
          margin-bottom: -2px; transition: color 0.2s, border-color 0.2s; white-space: nowrap;
        }
        .pp-tab:hover { color: var(--color-primary-600); }
        .pp-tab-active { color: var(--color-primary-700); border-bottom-color: var(--color-primary-600); }

        /* Cards */
        .pp-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg); padding: var(--space-xl);
        }
        .pp-sticky { position: sticky; top: 88px; }
        .pp-card-title { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-lg); font-weight: 700; }

        /* Service details */
        .pp-detail-list { display: flex; flex-direction: column; }
        .pp-detail-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 0; border-bottom: 1px solid var(--color-neutral-100);
          font-size: var(--font-size-sm); gap: var(--space-md);
        }
        .pp-detail-item:last-child { border-bottom: none; }
        .pp-detail-label { display: flex; align-items: center; gap: 6px; color: var(--color-neutral-500); }
        .pp-detail-value { font-weight: 600; color: var(--color-secondary-700); text-align: right; }
        .pp-token {
          font-family: monospace; background: var(--color-primary-50);
          color: var(--color-primary-700); padding: 2px 8px; border-radius: var(--radius-sm);
          font-size: var(--font-size-xs); letter-spacing: 0.08em;
        }
        .pp-verified-chip { padding: 2px 10px; border-radius: var(--radius-full); font-size: var(--font-size-xs); }
        .pp-verified-yes { background: #ecfdf5; color: #059669; }
        .pp-verified-no { background: var(--color-neutral-100); color: var(--color-neutral-500); }

        /* Full-width CTA section */
        .pp-cta-section {
          position: relative;
          background-size: cover; background-position: center;
          border-radius: var(--radius-xl); overflow: hidden;
          margin-top: var(--space-xl);
        }
        .pp-cta-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(10,35,18,0.72) 0%, rgba(15,80,40,0.60) 100%);
        }
        .pp-cta-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 64px 40px;
        }
        .pp-cta-glass {
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.28);
          border-radius: var(--radius-xl);
          padding: 40px 48px;
          text-align: center;
          max-width: 520px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        }
        .pp-cta-title {
          font-size: var(--font-size-2xl); font-weight: 800;
          color: white; margin-bottom: 12px;
        }
        .pp-cta-text {
          color: rgba(255,255,255,0.85); font-size: var(--font-size-base);
          line-height: 1.6; margin-bottom: 24px;
        }
        .pp-cta-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 36px; font-size: var(--font-size-base); font-weight: 700;
          background: white; color: var(--color-primary-700);
          border-radius: var(--radius-md); text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .pp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
