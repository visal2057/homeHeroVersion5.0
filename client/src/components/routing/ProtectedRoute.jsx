import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLE_HOME_ROUTE } from '../../constants/roles.js';

export default function ProtectedRoute({ roles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;

  // Section 3.4: a logged-in user from one role must not be able to reach another role's pages.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] ?? ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
