import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import ClientLayout from '../layouts/ClientLayout.jsx';
import GuestRoute from '../components/routing/GuestRoute.jsx';
import ProtectedRoute from '../components/routing/ProtectedRoute.jsx';
import RoleRoute from '../components/routing/RoleRoute.jsx';
import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';

import LandingPage from '../features/public/pages/LandingPage.jsx';
import AboutUsPage from '../features/public/pages/AboutUsPage.jsx';
import CareersPage from '../features/public/pages/CareersPage.jsx';
import ContactUsPage from '../features/public/pages/ContactUsPage.jsx';
import NotFoundPage from '../features/public/pages/NotFoundPage.jsx';

import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegistrationRolePage from '../features/auth/pages/RegistrationRolePage.jsx';
import ClientRegistrationPage from '../features/auth/pages/ClientRegistrationPage.jsx';
import ProviderRegistrationPage from '../features/auth/pages/ProviderRegistrationPage.jsx';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage.jsx';
import VerificationPendingPage from '../features/auth/pages/VerificationPendingPage.jsx';
import ApplicationRejectedPage from '../features/auth/pages/ApplicationRejectedPage.jsx';

import ClientHomePage from '../features/client/pages/ClientHomePage.jsx';
import ExploreServicePage from '../features/client/pages/ExploreServicePage.jsx';
import ProviderPublicProfilePage from '../features/client/pages/ProviderPublicProfilePage.jsx';
import BookingConfirmationPage from '../features/client/pages/BookingConfirmationPage.jsx';
import BookingRequestSentPage from '../features/client/pages/BookingRequestSentPage.jsx';
import MyBookingsPage from '../features/client/pages/MyBookingsPage.jsx';
import ClientProfilePage from '../features/client/pages/ClientProfilePage.jsx';
import ClientComplaintsPage from '../features/client/pages/ClientComplaintsPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.ABOUT} element={<AboutUsPage />} />
        <Route path={ROUTES.CAREERS} element={<CareersPage />} />
        <Route path={ROUTES.CONTACT} element={<ContactUsPage />} />
        <Route path={ROUTES.VERIFICATION_PENDING} element={<VerificationPendingPage />} />
        <Route path={ROUTES.APPLICATION_REJECTED} element={<ApplicationRejectedPage />} />

        <Route element={<GuestRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER_ROLE} element={<RegistrationRolePage />} />
          <Route path={ROUTES.REGISTER_CLIENT} element={<ClientRegistrationPage />} />
          <Route path={ROUTES.REGISTER_PROVIDER} element={<ProviderRegistrationPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Authenticated client pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.CLIENT]} />}>
          <Route element={<ClientLayout />}>
            <Route path={ROUTES.CLIENT_HOME} element={<ClientHomePage />} />
            <Route path={ROUTES.CLIENT_EXPLORE} element={<ExploreServicePage />} />
            <Route path={ROUTES.CLIENT_PROVIDER_PROFILE} element={<ProviderPublicProfilePage />} />
            <Route path={ROUTES.CLIENT_BOOKING_CONFIRM} element={<BookingConfirmationPage />} />
            <Route path={ROUTES.CLIENT_BOOKING_SENT} element={<BookingRequestSentPage />} />
            <Route path={ROUTES.CLIENT_MY_BOOKINGS} element={<MyBookingsPage />} />
            <Route path={ROUTES.CLIENT_PROFILE} element={<ClientProfilePage />} />
            <Route path={ROUTES.CLIENT_COMPLAINTS} element={<ClientComplaintsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
