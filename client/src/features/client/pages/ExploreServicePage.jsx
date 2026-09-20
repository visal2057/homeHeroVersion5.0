import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { ROLES } from '../../../constants/roles.js';
import { clientApi } from '../clientApi.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import ProviderCard from '../components/ProviderCard.jsx';
import TopProvidersSection from '../components/TopProvidersSection.jsx';
import PublicBookingModal from '../components/PublicBookingModal.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import PageHero from '../../../components/common/PageHero.jsx';
import RevealOnScroll from '../../../components/common/RevealOnScroll.jsx';
import { SkeletonGrid } from '../../../components/common/Skeleton.jsx';
import {
  IconLeaf, IconSparkle, IconPaw, IconWrench, IconSnowflake,
  IconToolbox, IconSearch, IconAlertCircle, IconArrowLeft, IconSend,
} from '../../../components/common/icons.jsx';

const CATEGORY_META = {
  gardening:  {
    label: 'Gardening',
    desc: 'Lawn care, pruning, landscaping & more',
    icon: IconLeaf,
    image: 'https://images.unsplash.com/photo-1650216600469-bb05741a636f?auto=format&fit=crop&w=2000&q=80',
  },
  cleaning:   {
    label: 'Cleaning',
    desc: 'Deep cleaning, regular housekeeping & sanitizing',
    icon: IconSparkle,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000&q=80',
  },
  'pet-care': {
    label: 'Pet Care',
    desc: 'Grooming, sitting, walking & veterinary support',
    icon: IconPaw,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=2000&q=80',
  },
  plumbing:   {
    label: 'Plumbing',
    desc: 'Leak repairs, pipe installations & drainage',
    icon: IconWrench,
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=2000&q=80',
  },
  'ac-repair':{
    label: 'AC Repair',
    desc: 'AC servicing, repairs & maintenance',
    icon: IconSnowflake,
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=2000&q=80',
  },
};

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Puttalam', 'Kurunegala',
  'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura',
  'Kegalle', 'Trincomalee', 'Batticaloa', 'Ampara',
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'rate_asc', label: 'Price: Low to High' },
  { value: 'rate_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export default function ExploreServicePage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const meta = CATEGORY_META[category] ?? { label: category, desc: '', icon: IconToolbox, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2000&q=80' };
  const HeroIcon = meta.icon;

  // Sends the visitor back to the homepage's service category cards, already
  // smoothly scrolled into view there (see LandingPage's `scrollTo` state
  // handling) rather than just dropping them at the top of the homepage.
  function handleBackToCategories() {
    navigate(ROUTES.HOME, { state: { scrollTo: 'hh-services-section' } });
  }

  const [showPublicBooking, setShowPublicBooking] = useState(false);
  // Same gating "Book Now" already uses elsewhere: hidden entirely for a
  // pending-provider viewer browsing while their application is under
  // review, and a logged-out visitor is sent to client signup instead of
  // opening the popup.
  const canBookPublic = user?.role !== ROLES.SERVICE_PROVIDER;
  function handlePublicBookingClick() {
    if (!user) {
      navigate(ROUTES.REGISTER_CLIENT, { state: { from: location } });
      return;
    }
    setShowPublicBooking(true);
  }

  const [providers, setProviders] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [sort, setSort] = useState('rating');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientApi.getProvidersByCategory(category, { district, search });
      const data = res.data?.data ?? {};
      setProviders(data.providers ?? []);
      setTopProviders(data.topProviders ?? []);
    } catch (err) {
      setProviders([]);
      setTopProviders([]);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [category, district, search]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const sorted = [...providers].sort((a, b) => {
    if (sort === 'rate_asc') return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
    if (sort === 'rate_desc') return (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0);
    if (sort === 'newest') return new Date(b.registeredAt ?? 0) - new Date(a.registeredAt ?? 0);
    return (b.averageRating ?? 0) - (a.averageRating ?? 0);
  });
  const displayed = sorted.slice(0, 20);

  return (
    <div className="explore-page">
      <PageHero image={meta.image} icon={HeroIcon} eyebrow="Explore Services" title={meta.label} subtitle={meta.desc} />

      <div className="container">
        <div className="ep-back-row">
          {canBookPublic && (
            <button type="button" className="ep-public-btn" onClick={handlePublicBookingClick}>
              <IconSend size={16} />
              Public Booking
            </button>
          )}
          <button type="button" className="ep-back-btn" onClick={handleBackToCategories}>
            <IconArrowLeft size={16} />
            Back to Categories
          </button>
        </div>

        {showPublicBooking && (
          <PublicBookingModal
            categorySlug={category}
            categoryLabel={meta.label}
            onClose={() => setShowPublicBooking(false)}
          />
        )}

        {topProviders.length > 0 && (
          <RevealOnScroll style={{ marginTop: 'var(--space-2xl)' }}>
            <TopProvidersSection providers={topProviders} category={meta.label} originCategory={category} />
          </RevealOnScroll>
        )}

        {/* Filters */}
        <div className="ep-filters">
          <div className="ep-search-wrap">
            <IconSearch size={19} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder={`Search ${meta.label} providers...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ep-search"
            />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="ep-select">
            <option value="">All Districts</option>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <option key={d} value={d.toLowerCase()}>{d}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="ep-select">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Results */}
        <div className="ep-results-header">
          <h2 className="ep-results-title">All {meta.label} Providers</h2>
          <span className="ep-results-count">{displayed.length} providers found</span>
        </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : error ? (
          <EmptyState
            icon={IconAlertCircle}
            tone="error"
            title="Couldn't load providers"
            message={error}
            actionLabel="Try Again"
            onAction={fetchProviders}
          />
        ) : displayed.length === 0 ? (
          <div className="ep-empty">
            <HeroIcon size={58} style={{ color: 'var(--color-neutral-300)', marginBottom: 'var(--space-md)' }} />
            <h3>No providers found</h3>
            <p>Try adjusting your filters or district selection.</p>
          </div>
        ) : (
          <div className="ep-grid">
            {displayed.map((p, i) => (
              <RevealOnScroll key={p.providerId ?? p.id} delay={Math.min(i, 6) * 0.05} y={16}>
                <ProviderCard provider={p} originCategory={category} />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .explore-page { padding-bottom: var(--space-2xl); }
        .ep-back-row { display: flex; justify-content: flex-end; gap: var(--space-sm); flex-wrap: wrap; margin-top: var(--space-lg); }
        .ep-back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 18px; border: none;
          border-radius: var(--radius-full); background: var(--color-primary-600);
          color: var(--color-neutral-0); font-family: inherit;
          font-size: var(--font-size-sm); font-weight: 600; cursor: pointer;
          position: relative; overflow: hidden;
          transition: background-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
        }
        .ep-back-btn:hover {
          background-color: var(--color-secondary-700);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
        }
        .ep-back-btn:active { transform: translateY(0); }
        .ep-public-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 18px; border: 1.5px solid var(--color-primary-600);
          border-radius: var(--radius-full); background: white;
          color: var(--color-primary-700); font-family: inherit;
          font-size: var(--font-size-sm); font-weight: 600; cursor: pointer;
          transition: background-color var(--transition-base), color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
        }
        .ep-public-btn:hover {
          background-color: var(--color-primary-600); color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.25);
        }
        .ep-public-btn:active { transform: translateY(0); }
        /* Diagonal shine sweep on hover, same mechanic as the SP dashboard
           logout button (see .provider-sidebar-footer button in provider.css). */
        .ep-back-btn::after {
          content: '';
          position: absolute; top: 0; left: -60%; width: 25%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.55), transparent);
          transform: skewX(-20deg);
          transition: left 0.4s ease;
          pointer-events: none;
        }
        .ep-back-btn:hover::after { left: 130%; }
        .ep-filters {
          display: flex; gap: var(--space-md); flex-wrap: wrap;
          margin: var(--space-xl) 0; align-items: center;
        }
        .ep-search-wrap { flex: 1; min-width: 240px; position: relative; }
        .ep-search {
          width: 100%; padding: 12px 17px 12px 46px;
          border: 1.5px solid var(--color-neutral-200); border-radius: var(--radius-md);
          font-size: var(--font-size-base); font-family: inherit; outline: none;
          transition: border-color var(--transition-base); box-sizing: border-box;
        }
        .ep-search:focus { border-color: var(--color-primary-500); }
        .ep-select {
          padding: 12px 17px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base);
          font-family: inherit; outline: none; background: white; cursor: pointer;
          transition: border-color var(--transition-base);
        }
        .ep-select:focus { border-color: var(--color-primary-500); }
        .ep-results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); }
        .ep-results-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); font-weight: 700; margin: 0; }
        .ep-results-count { color: var(--color-neutral-500); font-size: var(--font-size-sm); }
        .ep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: var(--space-lg); }
        .ep-empty { text-align: center; padding: var(--space-2xl) var(--space-md); color: var(--color-neutral-400); display: flex; flex-direction: column; align-items: center; }
        .ep-empty h3 { color: var(--color-neutral-600); margin-bottom: 8px; }

        /* Below 768px the fixed 380px column minimum in .ep-grid's
           auto-fill exceeds the available width on any phone viewport,
           forcing a wider-than-viewport track and horizontal page scroll -
           collapse to a single fluid column instead. */
        @media (max-width: 768px) {
          .ep-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
