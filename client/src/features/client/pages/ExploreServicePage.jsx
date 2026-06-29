import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { clientApi } from '../clientApi.js';
import ProviderCard from '../components/ProviderCard.jsx';
import TopProvidersSection from '../components/TopProvidersSection.jsx';

const CATEGORY_META = {
  gardening:  { label: 'Gardening',  emoji: '🌿', desc: 'Lawn care, pruning, landscaping & more' },
  cleaning:   { label: 'Cleaning',   emoji: '🧹', desc: 'Deep cleaning, regular housekeeping & sanitizing' },
  'pet-care': { label: 'Pet Care',   emoji: '🐾', desc: 'Grooming, sitting, walking & veterinary support' },
  plumbing:   { label: 'Plumbing',   emoji: '🔧', desc: 'Leak repairs, pipe installations & drainage' },
  'ac-repair':{ label: 'AC Repair',  emoji: '❄️', desc: 'AC servicing, repairs & maintenance' },
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

// Mock data for when API isn't ready yet
function mockProviders(category) {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `mock-${i}`,
    providerId: `mock-${i}`,
    name: ['Nimal Perera', 'Kamal Silva', 'Sitha Fernando', 'Ruwan Bandara', 'Chamara Jayawardena', 'Dilshan Rajapaksa', 'Hasini Wickrama', 'Priya Mendis'][i] ?? `Provider ${i + 1}`,
    district: ['colombo', 'gampaha', 'kandy', 'galle', 'matara', 'kurunegala', 'ratnapura', 'badulla'][i],
    averageRating: [4.8, 4.6, 4.9, 4.3, 4.7, 4.5, 4.2, 4.0][i],
    reviewCount: [42, 28, 63, 15, 37, 21, 9, 5][i],
    hourlyRate: [1500, 1200, 1800, 1000, 1600, 1100, 900, 1400][i],
    isVerified: i < 5,
    bio: `Experienced ${category} specialist with ${3 + i} years of professional service across Sri Lanka.`,
    workPreview: [],
  }));
}

export default function ExploreServicePage() {
  const { category } = useParams();
  const meta = CATEGORY_META[category] ?? { label: category, emoji: '🛠️', desc: '' };

  const [providers, setProviders] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [sort, setSort] = useState('rating');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientApi.getProvidersByCategory(category, { district, search });
      const data = res.data?.data ?? {};
      setProviders(data.providers ?? []);
      setTopProviders(data.topProviders ?? []);
    } catch {
      // API not ready – use mock data
      const mock = mockProviders(meta.label);
      setProviders(mock);
      setTopProviders(mock.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, [category, district, sort, search]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const sorted = [...providers].sort((a, b) => {
    if (sort === 'rate_asc') return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
    if (sort === 'rate_desc') return (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0);
    if (sort === 'newest') return 0; // already ordered newest-first by the backend
    return (b.averageRating ?? 0) - (a.averageRating ?? 0);
  });
  const displayed = sorted.slice(0, 20);

  return (
    <div className="explore-page">
      {/* Hero banner */}
      <div className="ep-hero">
        <div className="container">
          <div className="ep-hero-inner">
            <div className="ep-hero-icon">{meta.emoji}</div>
            <div>
              <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Explore Services</div>
              <h1 className="ep-hero-title">{meta.label}</h1>
              <p className="ep-hero-desc">{meta.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Top providers */}
        {topProviders.length > 0 && (
          <div style={{ marginTop: 'var(--space-2xl)' }}>
            <TopProvidersSection providers={topProviders} category={meta.label} />
          </div>
        )}

        {/* Filters */}
        <div className="ep-filters">
          <div className="ep-search-wrap">
            <span className="ep-search-icon">🔍</span>
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
          <div className="ep-loading">
            <div className="ep-spinner" />
            <p>Finding the best {meta.label.toLowerCase()} providers...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="ep-empty">
            <span>{meta.emoji}</span>
            <h3>No providers found</h3>
            <p>Try adjusting your filters or district selection.</p>
          </div>
        ) : (
          <div className="ep-grid">
            {displayed.map((p) => <ProviderCard key={p.providerId ?? p.id} provider={p} />)}
          </div>
        )}
      </div>

      <style>{`
        .explore-page { padding-bottom: var(--space-2xl); }
        .ep-hero {
          background: linear-gradient(135deg, var(--color-secondary-700) 0%, var(--color-primary-600) 100%);
          padding: var(--space-2xl) 0;
        }
        .ep-hero-inner { display: flex; align-items: center; gap: var(--space-xl); }
        .ep-hero-icon { font-size: 4rem; }
        .ep-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 8px; }
        .ep-hero-desc { color: rgba(255,255,255,0.75); font-size: var(--font-size-lg); margin: 0; }
        .ep-filters {
          display: flex; gap: var(--space-md); flex-wrap: wrap;
          margin: var(--space-xl) 0; align-items: center;
        }
        .ep-search-wrap { flex: 1; min-width: 200px; position: relative; }
        .ep-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .ep-search {
          width: 100%; padding: 10px 14px 10px 38px;
          border: 1.5px solid var(--color-neutral-200); border-radius: var(--radius-md);
          font-size: var(--font-size-base); font-family: inherit; outline: none;
          transition: border-color var(--transition-base); box-sizing: border-box;
        }
        .ep-search:focus { border-color: var(--color-primary-500); }
        .ep-select {
          padding: 10px 14px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base);
          font-family: inherit; outline: none; background: white; cursor: pointer;
          transition: border-color var(--transition-base);
        }
        .ep-select:focus { border-color: var(--color-primary-500); }
        .ep-results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); }
        .ep-results-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); font-weight: 700; margin: 0; }
        .ep-results-count { color: var(--color-neutral-500); font-size: var(--font-size-sm); }
        .ep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-lg); }
        .ep-loading { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-500); }
        .ep-spinner {
          width: 40px; height: 40px; border: 3px solid var(--color-neutral-200);
          border-top-color: var(--color-primary-500); border-radius: 50%;
          animation: spin 0.7s linear infinite; margin: 0 auto var(--space-md);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ep-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); }
        .ep-empty span { font-size: 3rem; display: block; margin-bottom: var(--space-md); }
        .ep-empty h3 { color: var(--color-neutral-600); }
      `}</style>
    </div>
  );
}
