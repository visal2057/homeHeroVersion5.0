import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';
import { ROUTES } from '../../constants/routes.js';

export default function AdminHeader({ roleLabel, homeRoute, navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);

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

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN);
  }

  function toggleBell() {
    setIsBellOpen((open) => !open);
    setReadIds(announcements.map((a) => a.announcementId));
  }

  const unreadCount = announcements.filter((a) => !readIds.includes(a.announcementId)).length;

  return (
    <header className="admin-header">
      <div className="container admin-header-inner">
        <div className="admin-brand">
          <NavLink to={homeRoute} style={{ color: 'inherit' }}>
            🛠️ HomeHero
          </NavLink>
          <span className="admin-role-badge">{roleLabel}</span>
        </div>

        <nav className="admin-header-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-header-actions" style={{ position: 'relative' }}>
          <button type="button" className="admin-bell" aria-label="Announcements" onClick={toggleBell}>
            🔔
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

          <span style={{ fontWeight: 600 }}>{user?.fullName ?? user?.username}</span>
          <button type="button" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
