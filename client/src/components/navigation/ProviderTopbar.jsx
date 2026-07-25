import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';
import { IconBell } from '../common/icons.jsx';

const PAGE_TITLES = {
  [ROUTES.PROVIDER_DASHBOARD]:     'Dashboard',
  [ROUTES.PROVIDER_REQUESTS]:      'Booking Requests',
  [ROUTES.PROVIDER_JOBS]:          'Jobs To Do',
  [ROUTES.PROVIDER_COMPLETED]:     'Completed Jobs',
  [ROUTES.PROVIDER_SUBSCRIPTIONS]: 'Subscriptions',
  [ROUTES.PROVIDER_PROFILE]:       'Profile & Settings',
  [ROUTES.PROVIDER_COMPLAINTS]:    'Complaints',
};

function initialsOf(name) {
  if (!name) return 'SP';
  return name.slice(0, 2).toUpperCase();
}

export default function ProviderTopbar({ onMenuToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const markedRef = useRef(new Set());
  const bellRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Provider Portal';
  const username = user?.username ?? 'Provider';

  useEffect(() => {
    let isMounted = true;
    axiosClient
      .get(API_ENDPOINTS.NOTIFICATIONS.FEED)
      .then(({ data }) => {
        if (isMounted) setAnnouncements(data.data ?? []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function markAsRead(id, type) {
    if (markedRef.current.has(id)) return;
    markedRef.current.add(id);
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    axiosClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(type, id)).catch(() => {
      markedRef.current.delete(id);
    });
  }

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <header className="provider-topbar">
      {/* Mobile hamburger — hidden on desktop via CSS, visible on mobile */}
      <button
        type="button"
        className="provider-topbar-icon-btn provider-topbar-hamburger"
        aria-label="Toggle sidebar"
        onClick={onMenuToggle}
      >
        <span className="provider-hamburger-line" />
        <span className="provider-hamburger-line" />
        <span className="provider-hamburger-line" />
      </button>

      <h1 className="provider-topbar-title">{pageTitle}</h1>

      <div className="provider-topbar-actions">
        {/* Notification bell */}
        <div className="provider-bell-wrap" ref={bellRef}>
          <button
            type="button"
            className="provider-topbar-icon-btn provider-bell"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setIsBellOpen((o) => !o)}
          >
            <IconBell size={20} />
            {unreadCount > 0 && <span className="provider-bell-dot" aria-hidden="true" />}
          </button>

          {isBellOpen && (
            <div className="provider-notification-panel">
              {announcements.length === 0 ? (
                <div className="provider-notification-item">No notifications yet.</div>
              ) : (
                announcements.map((a) => (
                  <div
                    key={a.feedKey ?? a.id}
                    className={`provider-notification-item${a.isRead ? '' : ' unread'}`}
                    onMouseEnter={() => markAsRead(a.id, a.type)}
                    onClick={() => markAsRead(a.id, a.type)}
                  >
                    <span className={`provider-notification-type-badge${a.type === 'ANNOUNCEMENT' ? ' is-announcement' : ' is-personal'}`}>
                      {a.type === 'ANNOUNCEMENT' ? 'Announcement' : 'Personal'}
                    </span>
                    <strong>{a.title}</strong>
                    <p>{a.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <span className="provider-topbar-divider" aria-hidden="true" />

        {/* Account bubble — read-only, all navigation lives in the sidebar */}
        <div className="provider-account-bubble" aria-label={`Signed in as ${username}`}>
          <span className="provider-account-avatar">{initialsOf(username)}</span>
          <span className="provider-account-name">{username}</span>
        </div>
      </div>
    </header>
  );
}
