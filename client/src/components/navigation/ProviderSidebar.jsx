import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useAlert } from '../../hooks/useAlert.js';
import {
  IconChartBar,
  IconInbox,
  IconWrench,
  IconCheckCircle,
  IconCreditCard,
  IconUser,
  IconClipboardList,
  IconLogOut,
} from '../common/icons.jsx';

const NAV_ITEMS = [
  { to: ROUTES.PROVIDER_DASHBOARD,     Icon: IconChartBar,     label: 'Dashboard' },
  { to: ROUTES.PROVIDER_REQUESTS,      Icon: IconInbox,        label: 'Booking Requests' },
  { to: ROUTES.PROVIDER_JOBS,          Icon: IconWrench,       label: 'Jobs To Do' },
  { to: ROUTES.PROVIDER_COMPLETED,     Icon: IconCheckCircle,  label: 'Completed Jobs' },
  { to: ROUTES.PROVIDER_SUBSCRIPTIONS, Icon: IconCreditCard,   label: 'Subscriptions' },
  { to: ROUTES.PROVIDER_PROFILE,       Icon: IconUser,         label: 'Profile & Settings' },
  { to: ROUTES.PROVIDER_COMPLAINTS,    Icon: IconClipboardList, label: 'Complaints' },
];

export default function ProviderSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { showSuccess } = useAlert();
  const navigate = useNavigate();

  async function handleLogout() {
    // Awaited so `user` is already cleared by the time we navigate --
    // otherwise GuestRoute (guarding /login) still sees the stale
    // logged-in user and bounces straight back, causing a duplicate
    // "session has ended" alert (see AdminHeader.jsx's handleLogout).
    await logout();
    showSuccess('You have logged out successfully.');
    navigate(ROUTES.LOGIN);
  }

  return (
    <aside className={`provider-sidebar ${isOpen ? 'open' : ''}`}>
      <Link to={ROUTES.PROVIDER_DASHBOARD} className="provider-sidebar-brand" onClick={onClose}>
        <span>HomeHero</span>
        <span className="provider-sidebar-badge">Provider</span>
      </Link>

      <nav className="provider-sidebar-nav" aria-label="Provider navigation">
        <p className="provider-sidebar-section-label">Navigation</p>

        {NAV_ITEMS.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.PROVIDER_DASHBOARD}
            className={({ isActive }) => `provider-nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="provider-nav-content">
              <span className="provider-nav-icon" aria-hidden="true">
                <Icon size={19} />
              </span>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="provider-sidebar-footer">
        <button type="button" onClick={handleLogout} aria-label="Log out">
          <span className="provider-nav-icon" aria-hidden="true">
            <IconLogOut size={19} />
          </span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
