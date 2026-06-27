import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/navigation/AdminHeader.jsx';
import { ROUTES } from '../constants/routes.js';

const NAV_ITEMS = [{ to: ROUTES.VERIFICATION_ADMIN_DASHBOARD, label: 'Dashboard', end: true }];

export default function VerificationAdminLayout() {
  return (
    <div className="admin-shell">
      <AdminHeader roleLabel="Verification Admin" homeRoute={ROUTES.VERIFICATION_ADMIN_DASHBOARD} navItems={NAV_ITEMS} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
