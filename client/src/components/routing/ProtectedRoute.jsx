import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLE_HOME_ROUTE, ROLES } from '../../constants/roles.js';

export default function ProtectedRoute({ roles, allowPendingProvider = false }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;

  // Opt-in exception (default off, so every route that doesn't pass this
  // prop behaves exactly as before): a Service Provider whose verification
  // is still PENDING may pass straight through, regardless of `roles`, for
  // the specific routes that explicitly allow it (Explore / provider-profile
  // viewing) while their application is under review.
  const isPendingProvider = user.role === ROLES.SERVICE_PROVIDER && user.verificationStatus === 'PENDING';
  if (allowPendingProvider && isPendingProvider) {
    return <Outlet />;
  }

  // Section 3.4: a logged-in user from one role must not be able to reach another role's pages.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] ?? ROUTES.LOGIN} replace />;
  }

  // Section 20: a Pending or Rejected Service Provider gets no provider
  // functionality -- only the waiting/rejected pages, even if they navigate
  // straight to a provider URL instead of coming through login.
  if (user.role === ROLES.SERVICE_PROVIDER && user.verificationStatus !== 'APPROVED') {
    const destination =
      user.verificationStatus === 'REJECTED' ? ROUTES.APPLICATION_REJECTED : ROUTES.VERIFICATION_PENDING;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
