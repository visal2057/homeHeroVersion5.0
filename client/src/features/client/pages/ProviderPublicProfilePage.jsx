import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { clientApi } from '../clientApi.js';
import ProviderProfileHeader from '../components/ProviderProfileHeader.jsx';
import PreviousWorkGallery from '../components/PreviousWorkGallery.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';

const MOCK_PROVIDER = {
  id: 'mock-1',
  providerId: 'mock-1',
  name: 'Nimal Perera',
  category: 'Gardening',
  district: 'colombo',
  hourlyRate: 1500,
  bio: 'Experienced gardening professional with over 10 years in lawn care, pruning, and landscape design. I have served over 200+ happy clients across Colombo and Gampaha districts.',
  isVerified: true,
  averageRating: 4.8,
  reviewCount: 42,
  workImages: [],
};

const MOCK_REVIEWS = [
  { id: 1, clientName: 'Dilini Fernando', rating: 5, comment: 'Excellent work! My garden looks amazing.', createdAt: '2025-12-15' },
  { id: 2, clientName: 'Kasun Jayawardena', rating: 4, comment: 'Very professional and on time. Will book again.', createdAt: '2025-11-28' },
  { id: 3, clientName: 'Priya Wickramasinghe', rating: 5, comment: 'Best gardener in the area, highly recommended!', createdAt: '2025-11-10' },
];

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
        <div className="ep-spinner" style={{ width: 48, height: 48 }} />
        <style>{`.ep-spinner { border: 3px solid var(--color-neutral-200); border-top-color: var(--color-primary-500); border-radius: 50%; animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <h2>Provider not found</h2>
        <Link to={ROUTES.CLIENT_HOME} className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Back to Home</Link>
      </div>
    );
  }

  const tabs = [
    { key: 'about', label: 'About' },
    { key: 'gallery', label: `Gallery (${provider.workImages?.length ?? 0})` },
    { key: 'reviews', label: `Reviews (${provider.reviewCount ?? reviews.length})` },
  ];

  return (
    <div className="provider-profile-page">
      <ProviderProfileHeader provider={provider} />

      <div className="container">
        {/* Tab navigation */}
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

        {/* Tab content */}
        <div className="pp-tab-content">
          {activeTab === 'about' && (
            <div className="pp-about">
              <div className="pp-about-grid">
                <div className="pp-card">
                  <h3 className="pp-card-title">About {provider.name}</h3>
                  <p style={{ color: 'var(--color-neutral-600)', lineHeight: 1.8 }}>
                    {provider.bio ?? 'No bio provided.'}
                  </p>
                </div>
                <div className="pp-card">
                  <h3 className="pp-card-title">Service Details</h3>
                  <div className="pp-detail-list">
                    <div className="pp-detail-item">
                      <span>🛠️ Category</span>
                      <span>{provider.category ?? 'N/A'}</span>
                    </div>
                    <div className="pp-detail-item">
                      <span>📍 District</span>
                      <span style={{ textTransform: 'capitalize' }}>{provider.district ?? 'N/A'}</span>
                    </div>
                    {provider.hourlyRate && (
                      <div className="pp-detail-item">
                        <span>💰 Rate</span>
                        <span>Rs. {provider.hourlyRate}/hr</span>
                      </div>
                    )}
                    <div className="pp-detail-item">
                      <span>✓ Verified</span>
                      <span>{provider.isVerified ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <Link
                    to={ROUTES.CLIENT_BOOKING_CONFIRM.replace(':providerId', provider.providerId ?? provider.id)}
                    className="btn btn-primary btn-shine"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-lg)' }}
                  >
                    📅 Book This Provider
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="pp-card">
              <h3 className="pp-card-title">Previous Work</h3>
              <PreviousWorkGallery images={provider.workImages ?? []} />
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

      <style>{`
        .provider-profile-page { padding-bottom: var(--space-2xl); }
        .pp-tabs {
          display: flex; gap: 0; border-bottom: 2px solid var(--color-neutral-200);
          margin: var(--space-xl) 0 var(--space-xl);
        }
        .pp-tab {
          padding: 12px 24px; background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: var(--font-size-base); font-weight: 600;
          color: var(--color-neutral-500); border-bottom: 2px solid transparent;
          margin-bottom: -2px; transition: color 0.2s, border-color 0.2s;
        }
        .pp-tab:hover { color: var(--color-primary-600); }
        .pp-tab-active { color: var(--color-primary-700); border-bottom-color: var(--color-primary-600); }
        .pp-tab-content { margin-bottom: var(--space-2xl); }
        .pp-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg); padding: var(--space-xl);
        }
        .pp-card-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: var(--space-lg); }
        .pp-about-grid { display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-xl); }
        @media (max-width: 768px) { .pp-about-grid { grid-template-columns: 1fr; } }
        .pp-detail-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .pp-detail-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid var(--color-neutral-100);
          font-size: var(--font-size-sm);
        }
        .pp-detail-item span:first-child { color: var(--color-neutral-500); }
        .pp-detail-item span:last-child { font-weight: 600; color: var(--color-secondary-700); }
      `}</style>
    </div>
  );
}
