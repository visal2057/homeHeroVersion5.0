import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';

const PAGE_TITLES = {
  [ROUTES.PROVIDER_DASHBOARD]:     'Dashboard',
  [ROUTES.PROVIDER_REQUESTS]:      'Booking Requests',
  [ROUTES.PROVIDER_JOBS]:          'Jobs To Do',
  [ROUTES.PROVIDER_COMPLETED]:     'Completed Jobs',
  [ROUTES.PROVIDER_SUBSCRIPTIONS]: 'Subscriptions',
  [ROUTES.PROVIDER_PROFILE]:       'Profile & Settings',
  [ROUTES.PROVIDER_COMPLAINTS]:    'Complaints',
};

export default function ProviderTopbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Provider Portal';
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'SP';

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setAccountOpen(false);
    logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <header className="provider-topbar">
      {/* Mobile hamburger — hidden on desktop via CSS, visible on mobile */}
      <button
        type="button"
        className="provider-topbar-icon-btn provider-topbar-hamburger"
        aria-label="Toggle sidebar"
        onClick={onMenuToggle}
      >
        ☰
      </button>

      <h1 className="provider-topbar-title">{pageTitle}</h1>

      <div className="provider-topbar-actions">
        {/* Notification bell */}
        <button
          type="button"
          className="provider-topbar-icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          🔔
          <span className="provider-notif-badge" aria-hidden="true" />
        </button>

        {/* Account menu */}
        <div className="provider-account-menu" ref={menuRef}>
          <button
            type="button"
            className="provider-topbar-avatar-placeholder"
            aria-label="Account menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((o) => !o)}
          >
            {initials}
          </button>

          {accountOpen && (
            <div className="provider-account-dropdown" role="menu">
              <div className="provider-account-dropdown-header">
                <div className="provider-account-dropdown-name">
                  {user?.username ?? 'Provider'}
                </div>
                <div className="provider-account-dropdown-role">Service Provider</div>
              </div>

              <Link
                to={ROUTES.PROVIDER_PROFILE}
                className="provider-account-dropdown-item"
                role="menuitem"
                onClick={() => setAccountOpen(false)}
              >
                👤 Profile & Settings
              </Link>

              <button
                type="button"
                className="provider-account-dropdown-item danger"
                role="menuitem"
                onClick={handleLogout}
              >
                🚪 Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
