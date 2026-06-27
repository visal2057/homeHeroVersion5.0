import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_HOME_ROUTE } from '../../constants/roles.js';

export default function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to={ROLE_HOME_ROUTE[user.role] ?? '/'} replace />;

  return <Outlet />;
}
