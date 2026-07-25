import { useEffect, useRef, useState, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useAlert } from '../../hooks/useAlert.js';
import { ROLES } from '../../constants/roles.js';
import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';
import { bookingApi } from '../../features/client/bookingApi.js';
import { emitBookingsChanged } from '../../utils/bookingEvents.js';
import {
  IconHome, IconUser, IconClipboardList, IconFlag,
  IconLogOut, IconChevronDown, IconBell,
} from '../common/icons.jsx';

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? 'var(--color-primary-700)' : 'var(--color-secondary-700)',
  fontWeight: 600,
});

const POLL_INTERVAL_MS = 30_000; // refresh announcements every 30 s

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  const isClient = user?.role === ROLES.CLIENT;
  // A Service Provider only ever renders this header while PENDING or
  // REJECTED (an APPROVED provider lives under the separate provider
  // layout/sidebar) - either way they get an account bubble whose only
  // menu item is Logout, no provider navigation.
  const isProvider = user?.role === ROLES.SERVICE_PROVIDER;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [rescheduleActingId, setRescheduleActingId] = useState(null);
  // Purely an optimistic, instant-hide layer for the brief window between
  // clicking Accept/Reject and the follow-up fetchAnnouncements() landing.
  // The actual source of truth for whether a reschedule notification is
  // still actionable is the server-computed `actionable` field on each feed
  // item (see notification.service.js), which reflects the booking's real
  // current status -- that's what makes this survive a page refresh.
  const [resolvedRescheduleIds, setResolvedRescheduleIds] = useState(() => new Set());

  const accountRef = useRef(null);
  const notifRef = useRef(null);
  const pollRef = useRef(null);

  const initials = user
    ? (user.firstName?.[0] ?? user.username?.[0] ?? 'U').toUpperCase()
    : 'U';
  const displayName = user?.firstName ?? user?.username ?? 'Account';
  const fullName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.username;

  // Scroll shadow
  useEffect(() => {
    function handleScroll() { setIsScrolled(window.scrollY > 8); }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setIsAccountOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch the combined personal-notification + announcement feed (called on
  // mount and every POLL_INTERVAL_MS)
  const fetchAnnouncements = useCallback(async () => {
    if (!isClient) return;
    try {
      const res = await axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.FEED);
      const list = res.data?.data ?? [];
      setAnnouncements(list);
    } catch { /* non-critical */ }
  }, [isClient]);

  useEffect(() => {
    fetchAnnouncements();
    if (isClient) {
      pollRef.current = setInterval(fetchAnnouncements, POLL_INTERVAL_MS);
    }
    return () => clearInterval(pollRef.current);
  }, [fetchAnnouncements, isClient]);

  function getId(a) {
    return a.id;
  }

  // Persists read-state on the server (same endpoint the Provider bell uses)
  // so it survives across devices instead of living only in localStorage.
  function markRead(id, type) {
    const target = announcements.find((a) => getId(a) === id);
    if (!target || target.isRead) return;
    setAnnouncements((prev) => prev.map((a) => (getId(a) === id ? { ...a, isRead: true } : a)));
    axiosClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(type, id)).catch(() => {
      setAnnouncements((prev) => prev.map((a) => (getId(a) === id ? { ...a, isRead: false } : a)));
    });
  }

  // Once a reschedule proposal is no longer actionable (the server says the
  // underlying booking has already moved past RESCHEDULE_PENDING) it drops
  // out of the bell entirely, per spec: an already-decided notification
  // would just be clutter. `actionable === false` is the server's ground
  // truth (survives refresh); resolvedRescheduleIds is only for the
  // instant, same-session hide right after a click, before the refetch lands.
  function isHiddenResolvedReschedule(a) {
    return a.type === 'PERSONAL' && a.relatedType === 'BOOKING_RESCHEDULE_PROPOSED'
      && (a.actionable === false || resolvedRescheduleIds.has(a.relatedId));
  }
  const visibleAnnouncements = announcements.filter((a) => !isHiddenResolvedReschedule(a));

  function markAllRead() {
    visibleAnnouncements.filter((a) => !a.isRead).forEach((a) => markRead(getId(a), a.type));
  }

  // The bell is the only place a Client acts on a Service Provider's
  // reschedule proposal -- Accept/Reject fire immediately (no second
  // confirmation on this side, matching the request's exact wording).
  // Either outcome refetches the feed so the actionable state (and thus
  // whether the notification stays visible at all) reflects the server's
  // current truth, and either outcome tells the client what happened --
  // silently doing nothing on failure previously made a genuine conflict
  // (e.g. the slot was taken) look identical to a successful accept.
  async function handleRescheduleDecision(bookingId, decision) {
    setRescheduleActingId(bookingId);
    try {
      if (decision === 'accept') await bookingApi.acceptReschedule(bookingId);
      else await bookingApi.rejectReschedule(bookingId);
      setResolvedRescheduleIds((prev) => new Set(prev).add(bookingId));
      // Lets an already-open My Bookings tab (same browser tab) reflect this
      // the instant it happens, instead of waiting on its own poll interval.
      emitBookingsChanged();
      await fetchAnnouncements();
      showSuccess(decision === 'accept' ? 'Rescheduling accepted successfully.' : 'Rescheduling rejected.');
    } catch (err) {
      await fetchAnnouncements();
      showError(err?.response?.data?.message ?? 'Could not process this reschedule decision. Please try again.');
    } finally {
      setRescheduleActingId(null);
    }
  }

  const unreadCount = visibleAnnouncements.filter((a) => !a.isRead).length;

  async function handleLogout() {
    // Awaited so `user` is already cleared by the time we navigate --
    // see AdminHeader.jsx's handleLogout for why this ordering matters.
    await logout();
    showSuccess('You have logged out successfully.');
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    navigate(ROUTES.HOME, { replace: true });
  }

  function closeMobileMenu() { setIsMobileMenuOpen(false); }

  function handleOpenNotif() {
    setIsNotifOpen((v) => !v);
    setIsAccountOpen(false);
  }

  return (
    <>
      <header className={`public-header ${isScrolled ? 'public-header-scrolled' : ''}`}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)' }}>
          <Link to={ROUTES.HOME} style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-secondary-700)' }}>
            HomeHero
          </Link>

          <nav className="public-header-nav">
            <NavLink to={ROUTES.HOME} style={navLinkStyle} end>Home</NavLink>
            <NavLink to={ROUTES.ABOUT} style={navLinkStyle}>About Us</NavLink>
            <NavLink to={ROUTES.CAREERS} style={navLinkStyle}>Careers</NavLink>
            <NavLink to={ROUTES.CONTACT} style={navLinkStyle}>Contact Us</NavLink>
          </nav>

          <div className="public-header-actions">
            {/* Notification bell — clients only */}
            {isClient && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button type="button" className="ph-bell-btn" aria-label="Notifications" onClick={handleOpenNotif}>
                  <IconBell size={20} style={{ color: 'var(--color-secondary-700)' }} />
                  {unreadCount > 0 && (
                    <span className="ph-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="ph-notif-dropdown animate-fade-in-up">
                    <div className="ph-notif-header">
                      <span className="ph-notif-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button type="button" className="ph-notif-mark-read" onClick={markAllRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {visibleAnnouncements.length === 0 ? (
                      <div className="ph-notif-empty">No notifications at the moment.</div>
                    ) : (
                      <div className="ph-notif-list">
                        {visibleAnnouncements.slice(0, 6).map((a) => {
                          const id = getId(a);
                          const isRead = a.isRead;
                          return (
                            <div
                              key={a.feedKey ?? id}
                              className={`ph-notif-item${isRead ? '' : ' ph-notif-item-unread'}`}
                              onMouseEnter={() => markRead(id, a.type)}
                              onClick={() => markRead(id, a.type)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && markRead(id, a.type)}
                            >
                              {!isRead && <span className="ph-notif-dot" />}
                              <div className="ph-notif-item-body">
                                <div className="ph-notif-item-title-row">
                                  <span className={`ph-notif-type-badge${a.type === 'ANNOUNCEMENT' ? ' is-announcement' : ' is-personal'}`}>
                                    {a.type === 'ANNOUNCEMENT' ? 'Announcement' : 'Personal'}
                                  </span>
                                </div>
                                <div className="ph-notif-item-title">{a.title}</div>
                                <div className={`ph-notif-item-msg${a.type === 'PERSONAL' ? ' ph-notif-item-msg-full' : ''}`}>
                                  {a.message}
                                </div>
                                {a.type === 'PERSONAL' && a.relatedType === 'BOOKING_RESCHEDULE_PROPOSED' && (
                                  <div className="ph-notif-item-actions" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      className="ph-notif-action-btn accept"
                                      disabled={rescheduleActingId === a.relatedId}
                                      onClick={() => handleRescheduleDecision(a.relatedId, 'accept')}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      className="ph-notif-action-btn reject"
                                      disabled={rescheduleActingId === a.relatedId}
                                      onClick={() => handleRescheduleDecision(a.relatedId, 'reject')}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                <div className="ph-notif-item-date">
                                  {a.createdAt
                                    ? new Date(a.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })
                                    : ''}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isClient ? (
              <div ref={accountRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="ph-avatar-btn"
                  aria-label="Account menu"
                  onClick={() => { setIsAccountOpen((v) => !v); setIsNotifOpen(false); }}
                >
                  <span className="ph-avatar-initials">{initials}</span>
                  <span className="ph-avatar-name">{displayName}</span>
                  <IconChevronDown size={14} style={{ color: 'var(--color-neutral-500)', flexShrink: 0 }} />
                </button>

                {isAccountOpen && (
                  <div className="ph-dropdown animate-fade-in-up">
                    <div className="ph-dropdown-header">
                      <div className="ph-dropdown-fullname">{fullName}</div>
                      <div className="ph-dropdown-email">{user?.email}</div>
                    </div>
                    <Link to={ROUTES.HOME} className="ph-dropdown-item" onClick={() => setIsAccountOpen(false)}>
                      <IconHome size={16} /> Home
                    </Link>
                    <Link to={ROUTES.CLIENT_PROFILE} className="ph-dropdown-item" onClick={() => setIsAccountOpen(false)}>
                      <IconUser size={16} /> My Profile
                    </Link>
                    <Link to={ROUTES.CLIENT_MY_BOOKINGS} className="ph-dropdown-item" onClick={() => setIsAccountOpen(false)}>
                      <IconClipboardList size={16} /> My Bookings
                    </Link>
                    <Link to={ROUTES.CLIENT_COMPLAINTS} className="ph-dropdown-item" onClick={() => setIsAccountOpen(false)}>
                      <IconFlag size={16} /> Complaints
                    </Link>
                    <div className="ph-dropdown-divider" />
                    <button type="button" className="ph-dropdown-item ph-dropdown-logout" onClick={handleLogout}>
                      <IconLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : isProvider ? (
              <div ref={accountRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="ph-avatar-btn"
                  aria-label="Account menu"
                  onClick={() => { setIsAccountOpen((v) => !v); setIsNotifOpen(false); }}
                >
                  <span className="ph-avatar-initials">{initials}</span>
                  <span className="ph-avatar-name">{displayName}</span>
                  <IconChevronDown size={14} style={{ color: 'var(--color-neutral-500)', flexShrink: 0 }} />
                </button>

                {isAccountOpen && (
                  <div className="ph-dropdown animate-fade-in-up">
                    <div className="ph-dropdown-header">
                      <div className="ph-dropdown-fullname">{fullName}</div>
                      <div className="ph-dropdown-email">{user?.email}</div>
                    </div>
                    <button type="button" className="ph-dropdown-item ph-dropdown-logout" onClick={handleLogout}>
                      <IconLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : user ? (
              <>
                <span style={{ fontWeight: 600, color: 'var(--color-secondary-700)' }}>{user.username}</span>
                <button type="button" className="btn btn-outline" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to={ROUTES.REGISTER_ROLE} className="btn btn-outline">Sign Up</Link>
                <Link to={ROUTES.LOGIN} className="btn btn-primary">Login</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="public-header-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="public-header-mobile-menu animate-fade-in-up">
            <NavLink to={ROUTES.HOME} onClick={closeMobileMenu} end>Home</NavLink>
            <NavLink to={ROUTES.ABOUT} onClick={closeMobileMenu}>About Us</NavLink>
            <NavLink to={ROUTES.CAREERS} onClick={closeMobileMenu}>Careers</NavLink>
            <NavLink to={ROUTES.CONTACT} onClick={closeMobileMenu}>Contact Us</NavLink>
            <hr />
            {isClient ? (
              <>
                <Link to={ROUTES.CLIENT_PROFILE} onClick={closeMobileMenu} className="btn btn-outline btn-block" style={{ marginBottom: 8 }}>My Profile</Link>
                <Link to={ROUTES.CLIENT_MY_BOOKINGS} onClick={closeMobileMenu} className="btn btn-outline btn-block" style={{ marginBottom: 8 }}>My Bookings</Link>
                <Link to={ROUTES.CLIENT_COMPLAINTS} onClick={closeMobileMenu} className="btn btn-outline btn-block" style={{ marginBottom: 8 }}>Complaints</Link>
                <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>Logout</button>
              </>
            ) : user ? (
              <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to={ROUTES.REGISTER_ROLE} className="btn btn-outline btn-block" onClick={closeMobileMenu}>Sign Up</Link>
                <Link to={ROUTES.LOGIN} className="btn btn-primary btn-block" onClick={closeMobileMenu}>Login</Link>
              </>
            )}
          </div>
        )}
      </header>

      <style>{`
        .ph-bell-btn {
          position: relative; background: none; border: none; cursor: pointer;
          padding: 8px; border-radius: var(--radius-md);
          transition: background var(--transition-base);
          display: flex; align-items: center; justify-content: center;
        }
        .ph-bell-btn:hover { background: var(--color-neutral-100); }
        .ph-bell-badge {
          position: absolute; top: 2px; right: 2px;
          background: #dc2626; color: white; font-size: 9px; font-weight: 700;
          min-width: 16px; height: 16px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px; border: 2px solid white;
        }
        .ph-notif-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: white; border-radius: var(--radius-lg);
          box-shadow: 0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid var(--color-neutral-150, #e8ecf0);
          overflow: hidden; z-index: 1000; min-width: 300px; max-width: 340px;
        }
        .ph-notif-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px; background: var(--color-primary-50);
          border-bottom: 1px solid var(--color-neutral-100);
        }
        .ph-notif-title { font-weight: 700; font-size: var(--font-size-sm); color: var(--color-secondary-700); }
        .ph-notif-mark-read {
          background: none; border: none; cursor: pointer; font-size: var(--font-size-xs);
          color: var(--color-primary-600); font-weight: 600; font-family: inherit; padding: 0;
        }
        .ph-notif-mark-read:hover { color: var(--color-primary-700); }
        .ph-notif-empty { padding: 20px 16px; text-align: center; color: var(--color-neutral-400); font-size: var(--font-size-sm); }
        .ph-notif-list { max-height: 320px; overflow-y: auto; }
        .ph-notif-item {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 12px 16px; border-bottom: 1px solid var(--color-neutral-100);
          transition: background var(--transition-base); cursor: pointer;
        }
        .ph-notif-item:last-child { border-bottom: none; }
        .ph-notif-item:hover { background: var(--color-neutral-50); }
        .ph-notif-item-unread { background: var(--color-primary-50); }
        .ph-notif-item-unread:hover { background: var(--color-primary-100); }
        .ph-notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary-600); flex-shrink: 0; margin-top: 5px; }
        .ph-notif-item-body { flex: 1; min-width: 0; }
        .ph-notif-item-title-row { margin-bottom: 3px; }
        .ph-notif-type-badge {
          display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.03em; padding: 1px 7px; border-radius: var(--radius-full);
        }
        .ph-notif-type-badge.is-announcement { background: #eff6ff; color: #1d4ed8; }
        .ph-notif-type-badge.is-personal { background: var(--color-primary-50); color: var(--color-primary-700); }
        .ph-notif-item-title { font-weight: 700; font-size: var(--font-size-sm); color: var(--color-secondary-700); margin-bottom: 2px; }
        .ph-notif-item-msg { font-size: var(--font-size-xs); color: var(--color-neutral-600); line-height: 1.5; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        /* Personal notifications carry specifics (a proposed date/time, a
           rejection reason, etc.) that must never be clamped -- unlike the
           generic Announcement messages, cutting them off mid-sentence loses
           real information the client needs. */
        .ph-notif-item-msg-full { -webkit-line-clamp: unset; overflow: visible; }
        .ph-notif-item-actions { display: flex; gap: 6px; margin: 6px 0 4px; }
        .ph-notif-action-btn {
          padding: 4px 12px; border-radius: var(--radius-md); border: none;
          font-size: var(--font-size-xs); font-weight: 600; cursor: pointer; font-family: inherit;
          transition: background var(--transition-base);
        }
        .ph-notif-action-btn.accept { background: var(--color-primary-600); color: white; }
        .ph-notif-action-btn.accept:hover { background: var(--color-primary-700); }
        .ph-notif-action-btn.reject { background: var(--color-error-bg); color: var(--color-error); }
        .ph-notif-action-btn.reject:hover { background: #fee2e2; }
        .ph-notif-action-btn:disabled { opacity: 0.6; cursor: default; }
        .ph-notif-item-date { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
        .ph-avatar-btn {
          background: none; border: 2px solid var(--color-primary-200); cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          padding: 4px 12px 4px 4px; border-radius: var(--radius-full);
          transition: border-color var(--transition-base), background var(--transition-base); font-family: inherit;
        }
        .ph-avatar-btn:hover { border-color: var(--color-primary-500); background: var(--color-primary-50); }
        .ph-avatar-initials {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--color-primary-600); color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--font-size-sm); flex-shrink: 0;
        }
        .ph-avatar-name {
          font-weight: 600; font-size: var(--font-size-sm); color: var(--color-secondary-700);
          max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ph-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: white; border-radius: var(--radius-lg);
          box-shadow: 0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid var(--color-neutral-150, #e8ecf0);
          overflow: hidden; z-index: 1000; min-width: 230px;
        }
        .ph-dropdown-header { padding: 15px 18px; background: var(--color-primary-50); border-bottom: 1px solid var(--color-neutral-100); }
        .ph-dropdown-fullname { font-weight: 700; font-size: var(--font-size-sm); color: var(--color-secondary-700); margin-bottom: 2px; }
        .ph-dropdown-email { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
        .ph-dropdown-item {
          display: flex; align-items: center; gap: 10px; padding: 12px 18px;
          color: var(--color-neutral-700); font-size: var(--font-size-sm); font-weight: 500;
          text-decoration: none; transition: background var(--transition-base), color var(--transition-base);
          cursor: pointer; border: none; background: none; width: 100%;
          text-align: left; font-family: inherit;
        }
        .ph-dropdown-item:hover { background: var(--color-primary-50); color: var(--color-primary-700); }
        .ph-dropdown-item::after { display: none; }
        .ph-dropdown-divider { height: 1px; background: var(--color-neutral-100); margin: 4px 0; }
        .ph-dropdown-logout { color: #dc2626; }
        .ph-dropdown-logout:hover { background: #fef2f2; color: #dc2626; }
      `}</style>
    </>
  );
}
