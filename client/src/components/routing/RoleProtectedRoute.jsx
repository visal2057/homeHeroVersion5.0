import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLE_HOME_ROUTE } from '../../constants/roles.js';

export default function RoleProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] ?? ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
