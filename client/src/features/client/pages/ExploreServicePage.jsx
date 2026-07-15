import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { clientApi } from '../clientApi.js';
import ProviderCard from '../components/ProviderCard.jsx';
import TopProvidersSection from '../components/TopProvidersSection.jsx';
import {
  IconLeaf, IconSparkle, IconPaw, IconWrench, IconSnowflake,
  IconToolbox, IconSearch,
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
  const meta = CATEGORY_META[category] ?? { label: category, desc: '', icon: IconToolbox, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2000&q=80' };
  const HeroIcon = meta.icon;

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
    return (b.averageRating ?? 0) - (a.averageRating ?? 0);
  });
  const displayed = sorted.slice(0, 20);

  return (
    <div className="explore-page">
      {/* Hero banner */}
      <div className="ep-hero" style={{ backgroundImage: `url(${meta.image})` }}>
        <div className="ep-hero-overlay" />
        <div className="container">
          <div className="ep-hero-inner">
            <div className="ep-hero-icon-wrap">
              <HeroIcon size={43} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>Explore Services</div>
              <h1 className="ep-hero-title">{meta.label}</h1>
              <p className="ep-hero-desc">{meta.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {topProviders.length > 0 && (
          <div style={{ marginTop: 'var(--space-2xl)' }}>
            <TopProvidersSection providers={topProviders} category={meta.label} />
          </div>
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
          <div className="ep-loading">
            <div className="ep-spinner" />
            <p>Finding the best {meta.label.toLowerCase()} providers...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="ep-empty">
            <HeroIcon size={58} style={{ color: 'var(--color-neutral-300)', marginBottom: 'var(--space-md)' }} />
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
          position: relative; background-size: cover; background-position: center;
          padding: 86px 0;
        }
        .ep-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,45,25,0.60) 0%, rgba(21,128,61,0.42) 100%);
        }
        .ep-hero-inner { display: flex; align-items: center; gap: var(--space-xl); position: relative; z-index: 1; }
        .ep-hero-icon-wrap {
          width: 86px; height: 86px; border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .ep-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 8px; }
        .ep-hero-desc { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin: 0; }
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
        .ep-loading { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-500); }
        .ep-spinner {
          width: 48px; height: 48px; border: 3px solid var(--color-neutral-200);
          border-top-color: var(--color-primary-500); border-radius: 50%;
          animation: spin 0.7s linear infinite; margin: 0 auto var(--space-md);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ep-empty { text-align: center; padding: var(--space-2xl) var(--space-md); color: var(--color-neutral-400); display: flex; flex-direction: column; align-items: center; }
        .ep-empty h3 { color: var(--color-neutral-600); margin-bottom: 8px; }
      `}</style>
    </div>
  );
}
