import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout    from '../layouts/PublicLayout.jsx';
import ProviderLayout  from '../layouts/ProviderLayout.jsx';
import GuestRoute      from '../components/routing/GuestRoute.jsx';
import ProtectedRoute  from '../components/routing/ProtectedRoute.jsx';
import { ROUTES }      from '../constants/routes.js';

import LandingPage            from '../features/public/pages/LandingPage.jsx';
import AboutUsPage            from '../features/public/pages/AboutUsPage.jsx';
import CareersPage            from '../features/public/pages/CareersPage.jsx';
import ContactUsPage          from '../features/public/pages/ContactUsPage.jsx';
import NotFoundPage           from '../features/public/pages/NotFoundPage.jsx';

import LoginPage              from '../features/auth/pages/LoginPage.jsx';
import RegistrationRolePage   from '../features/auth/pages/RegistrationRolePage.jsx';
import ClientRegistrationPage from '../features/auth/pages/ClientRegistrationPage.jsx';
import ProviderRegistrationPage from '../features/auth/pages/ProviderRegistrationPage.jsx';
import ForgotPasswordPage     from '../features/auth/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage      from '../features/auth/pages/ResetPasswordPage.jsx';
import VerificationPendingPage  from '../features/auth/pages/VerificationPendingPage.jsx';
import ApplicationRejectedPage  from '../features/auth/pages/ApplicationRejectedPage.jsx';

// Provider pages (Module 3)
import ProviderDashboardPage     from '../features/provider/pages/ProviderDashboardPage.jsx';
import ProviderRequestsPage      from '../features/provider/pages/ProviderRequestsPage.jsx';
import ProviderJobsToDoPage      from '../features/provider/pages/ProviderJobsToDoPage.jsx';
import ProviderCompletedJobsPage from '../features/provider/pages/ProviderCompletedJobsPage.jsx';
import ProviderSubscriptionsPage from '../features/provider/pages/ProviderSubscriptionsPage.jsx';
import ProviderProfilePage       from '../features/provider/pages/ProviderProfilePage.jsx';
import ProviderComplaintsPage    from '../features/provider/pages/ProviderComplaintsPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public layout ─────────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME}                  element={<LandingPage />} />
        <Route path={ROUTES.ABOUT}                 element={<AboutUsPage />} />
        <Route path={ROUTES.CAREERS}               element={<CareersPage />} />
        <Route path={ROUTES.CONTACT}               element={<ContactUsPage />} />
        <Route path={ROUTES.VERIFICATION_PENDING}  element={<VerificationPendingPage />} />
        <Route path={ROUTES.APPLICATION_REJECTED}  element={<ApplicationRejectedPage />} />

        <Route element={<GuestRoute />}>
          <Route path={ROUTES.LOGIN}             element={<LoginPage />} />
          <Route path={ROUTES.REGISTER_ROLE}     element={<RegistrationRolePage />} />
          <Route path={ROUTES.REGISTER_CLIENT}   element={<ClientRegistrationPage />} />
          <Route path={ROUTES.REGISTER_PROVIDER} element={<ProviderRegistrationPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD}   element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD}    element={<ResetPasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ── Provider layout (Module 3) ─────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProviderLayout />}>
          {/* Redirect bare /provider → dashboard */}
          <Route path="/provider" element={<Navigate to={ROUTES.PROVIDER_DASHBOARD} replace />} />

          <Route path={ROUTES.PROVIDER_DASHBOARD}     element={<ProviderDashboardPage />} />
          <Route path={ROUTES.PROVIDER_REQUESTS}      element={<ProviderRequestsPage />} />
          <Route path={ROUTES.PROVIDER_JOBS}          element={<ProviderJobsToDoPage />} />
          <Route path={ROUTES.PROVIDER_COMPLETED}     element={<ProviderCompletedJobsPage />} />
          <Route path={ROUTES.PROVIDER_SUBSCRIPTIONS} element={<ProviderSubscriptionsPage />} />
          <Route path={ROUTES.PROVIDER_PROFILE}       element={<ProviderProfilePage />} />
          <Route path={ROUTES.PROVIDER_COMPLAINTS}    element={<ProviderComplaintsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
