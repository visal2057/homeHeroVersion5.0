import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLE_HOME_ROUTE } from '../../constants/roles.js';

export default function RoleRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] ?? ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
