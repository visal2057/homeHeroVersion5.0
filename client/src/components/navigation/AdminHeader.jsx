import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useAlert } from '../../hooks/useAlert.js';
import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';
import { ROUTES } from '../../constants/routes.js';

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0][0].toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminHeader({ roleLabel, homeRoute, navItems, variant = 'classic' }) {
  const { user, logout } = useAuth();
  const { showSuccess } = useAlert();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const isModern = variant === 'modern';

  useEffect(() => {
    let isMounted = true;
    axiosClient
      .get(API_ENDPOINTS.ANNOUNCEMENTS.ACTIVE)
      .then(({ data }) => {
        if (isMounted) setAnnouncements(data.data.announcements ?? []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    // Awaited so `user` is already cleared by the time we navigate --
    // otherwise GuestRoute (guarding /login) still sees the stale
    // logged-in user, bounces straight back to the dashboard, and that
    // extra mount's data fetches race the now-revoked session, each
    // showing their own "session has ended" alert (the double-message bug).
    await logout();
    showSuccess('You have logged out successfully.');
    navigate(ROUTES.LOGIN);
  }

  function toggleBell() {
    setIsAccountOpen(false);
    setIsBellOpen((open) => !open);
    setReadIds(announcements.map((a) => a.announcementId));
  }

  function toggleAccount() {
    setIsBellOpen(false);
    setIsAccountOpen((open) => !open);
  }

  const unreadCount = announcements.filter((a) => !readIds.includes(a.announcementId)).length;
  const displayName = user?.fullName ?? user?.username;

  return (
    <header className={`admin-header${isModern ? ' admin-header-modern' : ''}`}>
      <div className="container admin-header-inner">
        <div className="admin-brand">
          <NavLink to={homeRoute} style={{ color: 'inherit' }}>
            HomeHero
          </NavLink>
          {isModern && <span className="admin-header-divider" aria-hidden="true" />}
          <span className="admin-role-badge">{roleLabel}</span>
        </div>

        <nav className={`admin-header-nav${isModern ? ' admin-header-nav-pill' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link${isModern ? ' admin-nav-link-pill' : ''}${isActive ? ' active' : ''}`}
              end={item.end}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-header-actions" style={{ position: 'relative' }}>
          <button type="button" className="admin-bell" aria-label="Announcements" onClick={toggleBell}>
            <BellIcon />
            {unreadCount > 0 && <span className="admin-bell-dot" aria-hidden="true" />}
          </button>

          {isBellOpen && (
            <div className="card admin-notification-panel animate-fade-in-up">
              {announcements.length === 0 ? (
                <div className="admin-notification-item">No announcements yet.</div>
              ) : (
                announcements.map((item) => (
                  <div key={item.announcementId} className="admin-notification-item">
                    <strong>{item.title}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-sm)' }}>{item.messageBody}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {isModern ? (
            <>
              <span className="admin-header-divider" aria-hidden="true" />
              <div style={{ position: 'relative' }}>
                <button type="button" className="admin-account-trigger" onClick={toggleAccount}>
                  <span className="admin-avatar-circle">{initialsOf(displayName)}</span>
                  <span className="admin-account-name">{displayName}</span>
                  <span className="admin-account-chevron" aria-hidden="true">▾</span>
                </button>

                {isAccountOpen && (
                  <div className="admin-account-dropdown animate-fade-in-up">
                    <div className="admin-account-dropdown-header">
                      <div className="admin-account-dropdown-role">Account</div>
                      <div className="admin-account-dropdown-username">{displayName}</div>
                    </div>
                    <button type="button" className="admin-account-dropdown-logout" onClick={handleLogout}>
                      <span aria-hidden="true">⎋</span> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600 }}>{displayName}</span>
              <button type="button" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
