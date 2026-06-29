import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { ROUTES } from '../../../constants/routes.js';
import { clientApi } from '../clientApi.js';

const SERVICES = [
  { label: 'Gardening', emoji: '🌿', slug: 'gardening', desc: 'Lawn care, pruning & landscaping', color: '#d1fae5' },
  { label: 'Cleaning', emoji: '🧹', slug: 'cleaning', desc: 'Deep cleaning & regular housekeeping', color: '#eff6ff' },
  { label: 'Pet Care', emoji: '🐾', slug: 'pet-care', desc: 'Grooming, sitting & walking', color: '#fef3c7' },
  { label: 'Plumbing', emoji: '🔧', slug: 'plumbing', desc: 'Leak repairs & installations', color: '#fdf2f8' },
  { label: 'AC Repair', emoji: '❄️', slug: 'ac-repair', desc: 'Servicing & maintenance', color: '#eff6ff' },
];

function ServiceCard({ service }) {
  const href = ROUTES.CLIENT_EXPLORE.replace(':category', service.slug);
  return (
    <Link to={href} className="ch-service-card" style={{ '--card-bg': service.color }}>
      <div className="ch-service-icon">{service.emoji}</div>
      <div className="ch-service-name">{service.label}</div>
      <div className="ch-service-desc">{service.desc}</div>
      <span className="ch-service-arrow">→</span>
    </Link>
  );
}

function AnnouncementBanner({ announcements }) {
  const [idx, setIdx] = useState(0);
  if (!announcements?.length) return null;
  const a = announcements[idx];
  return (
    <div className="ch-announcement">
      <span>📢</span>
      <span className="ch-announcement-text">{a.message ?? a.title}</span>
      {announcements.length > 1 && (
        <div className="ch-announcement-nav">
          {announcements.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} className={`ch-ann-dot${i === idx ? ' active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    clientApi.getAnnouncements().then((r) => setAnnouncements(r.data?.data ?? [])).catch(() => {});
  }, []);

  const firstName = user?.firstName ?? user?.username ?? 'there';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="client-home">
      {/* Hero welcome banner */}
      <section className="ch-hero">
        <div className="container">
          <AnnouncementBanner announcements={announcements} />
          <div className="ch-hero-inner">
            <div className="ch-hero-text">
              <div className="hh-eyebrow">HomeHero Client Portal</div>
              <h1 className="ch-hero-title">
                {greeting}, <span className="ch-hero-name">{firstName}</span>! 👋
              </h1>
              <p className="ch-hero-sub">
                What service do you need today? Browse trusted, verified professionals across Sri Lanka.
              </p>
              <div className="ch-hero-actions">
                <Link to={ROUTES.CLIENT_MY_BOOKINGS} className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                  📋 My Bookings
                </Link>
              </div>
            </div>
            <div className="ch-hero-stats">
              <div className="ch-stat">
                <span className="ch-stat-num">500+</span>
                <span className="ch-stat-label">Verified Providers</span>
              </div>
              <div className="ch-stat">
                <span className="ch-stat-num">5</span>
                <span className="ch-stat-label">Service Categories</span>
              </div>
              <div className="ch-stat">
                <span className="ch-stat-num">25</span>
                <span className="ch-stat-label">Districts Covered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="ch-services">
        <div className="container">
          <div className="ch-section-header">
            <div className="hh-section-kicker">What We Offer</div>
            <h2 className="ch-section-title">Choose a Service Category</h2>
            <p className="ch-section-sub">Tap any card to explore top-rated providers in that category</p>
          </div>
          <div className="ch-services-grid">
            {SERVICES.map((s) => <ServiceCard key={s.slug} service={s} />)}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="ch-quick-links">
        <div className="container">
          <div className="ch-ql-grid">
            <div className="ch-ql-card" onClick={() => navigate(ROUTES.CLIENT_PROFILE)}>
              <span className="ch-ql-icon">👤</span>
              <div>
                <div className="ch-ql-title">My Profile</div>
                <div className="ch-ql-sub">Update your details & location</div>
              </div>
              <span className="ch-ql-arrow">→</span>
            </div>
            <div className="ch-ql-card" onClick={() => navigate(ROUTES.CLIENT_MY_BOOKINGS)}>
              <span className="ch-ql-icon">📋</span>
              <div>
                <div className="ch-ql-title">My Bookings</div>
                <div className="ch-ql-sub">Track requests & upcoming jobs</div>
              </div>
              <span className="ch-ql-arrow">→</span>
            </div>
            <div className="ch-ql-card" onClick={() => navigate(ROUTES.CLIENT_COMPLAINTS)}>
              <span className="ch-ql-icon">📣</span>
              <div>
                <div className="ch-ql-title">Submit Complaint</div>
                <div className="ch-ql-sub">Report an issue with a service</div>
              </div>
              <span className="ch-ql-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .client-home { padding-bottom: var(--space-2xl); }

        /* Hero */
        .ch-hero {
          background: linear-gradient(135deg, var(--color-secondary-700) 0%, var(--color-primary-600) 100%);
          color: white; padding: var(--space-2xl) 0;
          position: relative; overflow: hidden;
        }
        .ch-hero::before {
          content: ''; position: absolute; top: -40%; right: -10%;
          width: 500px; height: 500px; border-radius: 50%;
          background: rgba(255,255,255,0.04); pointer-events: none;
        }
        .ch-hero-inner { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2xl); flex-wrap: wrap; }
        .ch-hero-text { flex: 1; min-width: 260px; }
        .ch-hero-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: white; margin-bottom: var(--space-md); }
        .ch-hero-name { color: var(--color-primary-300); }
        .ch-hero-sub { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin-bottom: var(--space-xl); }
        .ch-hero-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; }
        .ch-hero-stats { display: flex; gap: var(--space-xl); flex-wrap: wrap; }
        .ch-stat { text-align: center; }
        .ch-stat-num { display: block; font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-primary-200); }
        .ch-stat-label { font-size: var(--font-size-xs); color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.05em; }

        /* Announcement */
        .ch-announcement {
          display: flex; align-items: center; gap: var(--space-md);
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          border-radius: var(--radius-md); padding: 10px 16px;
          margin-bottom: var(--space-xl); font-size: var(--font-size-sm);
          border: 1px solid rgba(255,255,255,0.2); flex-wrap: wrap;
        }
        .ch-announcement-text { flex: 1; color: rgba(255,255,255,0.9); }
        .ch-announcement-nav { display: flex; gap: 4px; align-items: center; }
        .ch-ann-dot {
          width: 6px; height: 6px; border-radius: 50%; border: none;
          background: rgba(255,255,255,0.3); cursor: pointer; padding: 0;
          transition: background 0.2s;
        }
        .ch-ann-dot.active { background: white; }

        /* Services */
        .ch-services { padding: var(--space-2xl) 0; }
        .ch-section-header { text-align: center; margin-bottom: var(--space-xl); }
        .ch-section-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: var(--space-sm); }
        .ch-section-sub { color: var(--color-neutral-500); }
        .ch-services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-lg); }
        .ch-service-card {
          display: flex; flex-direction: column; align-items: flex-start;
          padding: var(--space-xl); border-radius: var(--radius-lg);
          background: var(--card-bg, var(--color-neutral-50));
          border: 1px solid var(--color-neutral-200); text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          gap: var(--space-sm); position: relative; overflow: hidden;
        }
        .ch-service-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .ch-service-card::after { display: none; }
        .ch-service-icon { font-size: 2rem; }
        .ch-service-name { font-weight: 700; font-size: var(--font-size-lg); color: var(--color-secondary-700); }
        .ch-service-desc { font-size: var(--font-size-sm); color: var(--color-neutral-500); }
        .ch-service-arrow { margin-top: auto; font-size: var(--font-size-lg); color: var(--color-primary-600); font-weight: 700; }

        /* Quick links */
        .ch-quick-links { padding-bottom: var(--space-xl); }
        .ch-ql-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-lg); }
        .ch-ql-card {
          display: flex; align-items: center; gap: var(--space-md);
          padding: var(--space-lg); background: white;
          border-radius: var(--radius-lg); border: 1px solid var(--color-neutral-200);
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
        }
        .ch-ql-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .ch-ql-icon { font-size: 1.75rem; flex-shrink: 0; }
        .ch-ql-title { font-weight: 700; color: var(--color-secondary-700); font-size: var(--font-size-base); }
        .ch-ql-sub { font-size: var(--font-size-xs); color: var(--color-neutral-500); }
        .ch-ql-arrow { margin-left: auto; color: var(--color-primary-600); font-size: 1.1rem; }
      `}</style>
    </div>
  );
}
