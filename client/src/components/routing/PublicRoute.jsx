import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_HOME_ROUTE, ROLES } from '../../constants/roles.js';

// Guards the public marketing pages (Home/About/Careers/Contact). Guests and
// authenticated Clients may view them (the Client role's home route is '/'
// itself), but every other authenticated role must stay confined to their
// own dashboard rather than being able to browse back out to the public site.
export default function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user && user.role !== ROLES.CLIENT) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] ?? '/'} replace />;
  }

  return <Outlet />;
}
