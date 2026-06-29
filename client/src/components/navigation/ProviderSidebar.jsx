import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';

const NAV_ITEMS = [
  { to: ROUTES.PROVIDER_DASHBOARD,     icon: '📊', label: 'Dashboard' },
  { to: ROUTES.PROVIDER_REQUESTS,      icon: '📥', label: 'Booking Requests' },
  { to: ROUTES.PROVIDER_JOBS,          icon: '🔧', label: 'Jobs To Do' },
  { to: ROUTES.PROVIDER_COMPLETED,     icon: '✅', label: 'Completed Jobs' },
  { to: ROUTES.PROVIDER_SUBSCRIPTIONS, icon: '💳', label: 'Subscriptions' },
  { to: ROUTES.PROVIDER_PROFILE,       icon: '👤', label: 'Profile & Settings' },
  { to: ROUTES.PROVIDER_COMPLAINTS,    icon: '📋', label: 'Complaints' },
];

export default function ProviderSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <aside className={`provider-sidebar ${isOpen ? 'open' : ''}`}>
      <Link to={ROUTES.PROVIDER_DASHBOARD} className="provider-sidebar-brand" onClick={onClose}>
        <span>🛠️ HomeHero</span>
        <span className="provider-sidebar-badge">Provider</span>
      </Link>

      <nav className="provider-sidebar-nav" aria-label="Provider navigation">
        <p className="provider-sidebar-section-label">Navigation</p>

        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.PROVIDER_DASHBOARD}
            className={({ isActive }) => `provider-nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="provider-nav-icon" aria-hidden="true">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="provider-sidebar-footer">
        <button type="button" onClick={handleLogout} aria-label="Log out">
          <span className="provider-nav-icon" aria-hidden="true">🚪</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
