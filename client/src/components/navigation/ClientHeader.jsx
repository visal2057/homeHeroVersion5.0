import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';

const NAV_LINKS = [
  { label: 'Home', to: ROUTES.CLIENT_HOME },
  { label: 'About Us', to: ROUTES.ABOUT },
  { label: 'Careers', to: ROUTES.CAREERS },
  { label: 'Contact Us', to: ROUTES.CONTACT },
];

const SERVICES = [
  { label: 'Gardening', emoji: '🌿', slug: 'gardening' },
  { label: 'Cleaning', emoji: '🧹', slug: 'cleaning' },
  { label: 'Pet Care', emoji: '🐾', slug: 'pet-care' },
  { label: 'Plumbing', emoji: '🔧', slug: 'plumbing' },
  { label: 'AC Repair', emoji: '❄️', slug: 'ac-repair' },
];

export default function ClientHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const accountRef = useRef(null);
  const notifRef = useRef(null);
  const exploreRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setIsAccountOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target)) setIsExploreOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    navigate(ROUTES.HOME);
  }

  const exploreHref = (slug) => ROUTES.CLIENT_EXPLORE.replace(':category', slug);

  const initials = user
    ? (user.firstName?.[0] ?? user.username?.[0] ?? 'U').toUpperCase()
    : 'U';

  return (
    <>
      <header className={`public-header${isScrolled ? ' public-header-scrolled' : ''}`}>
        <div
          className="container"
          style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)' }}
        >
          {/* Logo */}
          <Link
            to={ROUTES.CLIENT_HOME}
            style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-secondary-700)', flexShrink: 0 }}
          >
            🛠️ HomeHero
          </Link>

          {/* Desktop nav */}
          <nav className="public-header-nav" style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === ROUTES.CLIENT_HOME}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--color-primary-700)' : 'var(--color-secondary-700)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                })}
              >
                {label}
              </NavLink>
            ))}

            {/* Explore services dropdown */}
            <div ref={exploreRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsExploreOpen((v) => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontWeight: 600,
                  color: 'var(--color-secondary-700)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                Explore ▾
              </button>
              {isExploreOpen && (
                <div className="ch-dropdown animate-fade-in-up" style={{ minWidth: 180 }}>
                  {SERVICES.map(({ label, emoji, slug }) => (
                    <Link
                      key={slug}
                      to={exploreHref(slug)}
                      className="ch-dropdown-item"
                      onClick={() => setIsExploreOpen(false)}
                    >
                      {emoji} {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexShrink: 0 }}>
            {/* Notification bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="ch-icon-btn"
                aria-label="Notifications"
                onClick={() => { setIsNotifOpen((v) => !v); setIsAccountOpen(false); }}
              >
                🔔
                <span className="ch-notif-badge" />
              </button>
              {isNotifOpen && (
                <div className="ch-dropdown animate-fade-in-up" style={{ right: 0, left: 'auto', minWidth: 280 }}>
                  <div className="ch-dropdown-header">Announcements</div>
                  <div className="ch-dropdown-empty">No new announcements.</div>
                </div>
              )}
            </div>

            {/* Account bubble */}
            <div ref={accountRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="ch-avatar-btn"
                aria-label="Account menu"
                onClick={() => { setIsAccountOpen((v) => !v); setIsNotifOpen(false); }}
              >
                <span className="ch-avatar-initials">{initials}</span>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary-700)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.firstName ?? user?.username ?? 'Account'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-neutral-500)' }}>▾</span>
              </button>
              {isAccountOpen && (
                <div className="ch-dropdown animate-fade-in-up" style={{ right: 0, left: 'auto', minWidth: 200 }}>
                  <div className="ch-dropdown-header">
                    {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.username}
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)', fontWeight: 400 }}>{user?.email}</div>
                  </div>
                  <Link to={ROUTES.CLIENT_HOME} className="ch-dropdown-item" onClick={() => setIsAccountOpen(false)}>🏠 Home</Link>
                  <Link to={ROUTES.CLIENT_PROFILE} className="ch-dropdown-item" onClick={() => setIsAccountOpen(false)}>👤 My Profile</Link>
                  <Link to={ROUTES.CLIENT_MY_BOOKINGS} className="ch-dropdown-item" onClick={() => setIsAccountOpen(false)}>📋 My Bookings</Link>
                  <Link to={ROUTES.CLIENT_COMPLAINTS} className="ch-dropdown-item" onClick={() => setIsAccountOpen(false)}>📣 Complaints</Link>
                  <div className="ch-dropdown-divider" />
                  <button type="button" className="ch-dropdown-item ch-dropdown-logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="public-header-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="public-header-mobile-menu animate-fade-in-up">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink key={to} to={to} end={to === ROUTES.CLIENT_HOME} onClick={() => setIsMobileMenuOpen(false)}>
                {label}
              </NavLink>
            ))}
            <div style={{ fontWeight: 600, color: 'var(--color-secondary-700)', padding: '0.5rem 0 0.25rem' }}>Explore Services</div>
            {SERVICES.map(({ label, emoji, slug }) => (
              <Link key={slug} to={exploreHref(slug)} onClick={() => setIsMobileMenuOpen(false)} style={{ paddingLeft: 'var(--space-md)' }}>
                {emoji} {label}
              </Link>
            ))}
            <hr />
            <Link to={ROUTES.CLIENT_PROFILE} onClick={() => setIsMobileMenuOpen(false)} className="btn btn-outline btn-block">👤 My Profile</Link>
            <Link to={ROUTES.CLIENT_MY_BOOKINGS} onClick={() => setIsMobileMenuOpen(false)} className="btn btn-outline btn-block" style={{ marginTop: 8 }}>📋 My Bookings</Link>
            <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 8 }} onClick={handleLogout}>🚪 Logout</button>
          </div>
        )}
      </header>

      <style>{`
        .ch-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          transition: background var(--transition-base);
        }
        .ch-icon-btn:hover {
          background: var(--color-primary-50);
        }
        .ch-notif-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: var(--color-error);
          border-radius: 50%;
          border: 2px solid white;
        }
        .ch-avatar-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: var(--radius-full);
          border: 2px solid var(--color-primary-200);
          transition: border-color var(--transition-base), background var(--transition-base);
        }
        .ch-avatar-btn:hover {
          border-color: var(--color-primary-500);
          background: var(--color-primary-50);
        }
        .ch-avatar-initials {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-primary-600);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: var(--font-size-sm);
          flex-shrink: 0;
        }
        .ch-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: white;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-neutral-200);
          overflow: hidden;
          z-index: 1000;
        }
        .ch-dropdown-header {
          padding: 12px 16px;
          background: var(--color-primary-50);
          font-weight: 600;
          color: var(--color-secondary-700);
          border-bottom: 1px solid var(--color-neutral-200);
          font-size: var(--font-size-sm);
        }
        .ch-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          color: var(--color-neutral-700);
          font-size: var(--font-size-sm);
          text-decoration: none;
          transition: background var(--transition-base), color var(--transition-base);
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }
        .ch-dropdown-item:hover {
          background: var(--color-primary-50);
          color: var(--color-primary-700);
        }
        .ch-dropdown-item::after { display: none; }
        .ch-dropdown-divider {
          height: 1px;
          background: var(--color-neutral-200);
          margin: 4px 0;
        }
        .ch-dropdown-empty {
          padding: 16px;
          color: var(--color-neutral-500);
          font-size: var(--font-size-sm);
          text-align: center;
        }
        .ch-dropdown-logout {
          color: var(--color-error);
        }
        .ch-dropdown-logout:hover {
          background: #fef2f2;
          color: var(--color-error);
        }
      `}</style>
    </>
  );
}
