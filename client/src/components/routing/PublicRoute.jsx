import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_HOME_ROUTE, ROLES } from '../../constants/roles.js';

// Guards the public marketing pages (Home/About/Careers/Contact). Guests and
// authenticated Clients may view them (the Client role's home route is '/'
// itself), but every other authenticated role must stay confined to their
// own dashboard rather than being able to browse back out to the public site.
//
// One exception: a Service Provider whose verification is still PENDING may
// also browse these pages (and, separately, Explore/provider-profile pages -
// see ProtectedRoute's `allowPendingProvider`) while their application is
// under review, so they aren't left with nowhere to go but the waiting
// screen. Once APPROVED or REJECTED, this exception no longer applies and
// they're routed to their dashboard / rejection page as before.
export default function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const isPendingProvider = user?.role === ROLES.SERVICE_PROVIDER && user?.verificationStatus === 'PENDING';

  if (user && user.role !== ROLES.CLIENT && !isPendingProvider) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] ?? '/'} replace />;
  }

  return <Outlet />;
}
