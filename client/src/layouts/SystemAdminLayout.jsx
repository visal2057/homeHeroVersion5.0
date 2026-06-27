import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/navigation/AdminHeader.jsx';
import { ROUTES } from '../constants/routes.js';

const NAV_ITEMS = [
  { to: ROUTES.SYSTEM_ADMIN_DASHBOARD, label: 'Dashboard', end: true },
  { to: ROUTES.SYSTEM_ADMIN_BOOKINGS, label: 'Bookings Management' },
  { to: ROUTES.SYSTEM_ADMIN_USERS, label: 'User Management' },
  { to: ROUTES.SYSTEM_ADMIN_CONTENT, label: 'Content Management' },
  { to: ROUTES.SYSTEM_ADMIN_ANNOUNCEMENTS, label: 'Announcements' },
];

export default function SystemAdminLayout() {
  return (
    <div className="admin-shell">
      <AdminHeader roleLabel="System Admin" homeRoute={ROUTES.SYSTEM_ADMIN_DASHBOARD} navItems={NAV_ITEMS} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
