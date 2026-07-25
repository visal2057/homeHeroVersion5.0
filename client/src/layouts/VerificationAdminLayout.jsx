import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/navigation/AdminHeader.jsx';
import { ROUTES } from '../constants/routes.js';

const NAV_ITEMS = [
  { to: ROUTES.VERIFICATION_ADMIN_DASHBOARD, label: 'Dashboard', end: true },
  { to: ROUTES.VERIFICATION_ADMIN_APPLICATIONS, label: 'Applications', end: true },
  { to: ROUTES.VERIFICATION_ADMIN_COMPLAINTS, label: 'Complaints', end: true },
];

export default function VerificationAdminLayout() {
  return (
    <div className="admin-shell">
      <AdminHeader roleLabel="Verification Admin" homeRoute={ROUTES.VERIFICATION_ADMIN_DASHBOARD} navItems={NAV_ITEMS} variant="modern" />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
