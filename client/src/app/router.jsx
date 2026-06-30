import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout    from '../layouts/PublicLayout.jsx';
import ProviderLayout  from '../layouts/ProviderLayout.jsx';
import ClientLayout    from '../layouts/ClientLayout.jsx';
import SystemAdminLayout       from '../layouts/SystemAdminLayout.jsx';
import VerificationAdminLayout from '../layouts/VerificationAdminLayout.jsx';
import GuestRoute      from '../components/routing/GuestRoute.jsx';
import ProtectedRoute  from '../components/routing/ProtectedRoute.jsx';
import { ROUTES }      from '../constants/routes.js';
import { ROLES }       from '../constants/roles.js';

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

import SystemAdminDashboardPage from '../features/admin/system/pages/SystemAdminDashboardPage.jsx';
import BookingManagementPage from '../features/admin/system/pages/BookingManagementPage.jsx';
import UserManagementPage from '../features/admin/system/pages/UserManagementPage.jsx';
import ContentManagementPage from '../features/admin/system/pages/ContentManagementPage.jsx';
import AnnouncementsPage from '../features/admin/system/pages/AnnouncementsPage.jsx';

import VerificationDashboardPage from '../features/admin/verification/pages/VerificationDashboardPage.jsx';
import VerificationReviewPage from '../features/admin/verification/pages/VerificationReviewPage.jsx';
import ComplaintReviewPage from '../features/admin/verification/pages/ComplaintReviewPage.jsx';

import ExploreServicePage from '../features/client/pages/ExploreServicePage.jsx';
import ProviderPublicProfilePage from '../features/client/pages/ProviderPublicProfilePage.jsx';
import BookingConfirmationPage from '../features/client/pages/BookingConfirmationPage.jsx';
import BookingRequestSentPage from '../features/client/pages/BookingRequestSentPage.jsx';
import MyBookingsPage from '../features/client/pages/MyBookingsPage.jsx';
import ClientProfilePage from '../features/client/pages/ClientProfilePage.jsx';
import ClientComplaintsPage from '../features/client/pages/ClientComplaintsPage.jsx';

// Payment + review pages (Module 4 - Visal)
import BookingPaymentPage from '../features/payments/client/pages/BookingPaymentPage.jsx';
import SubmitReviewPage from '../features/payments/client/pages/SubmitReviewPage.jsx';
import PaymentSuccessPage from '../features/payments/client/pages/PaymentSuccessPage.jsx';
import PaymentFailedPage from '../features/payments/client/pages/PaymentFailedPage.jsx';

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
      <Route element={<ProtectedRoute roles={[ROLES.SERVICE_PROVIDER]} />}>
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

      {/* ── Client layout ────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={[ROLES.CLIENT]} />}>
        <Route element={<ClientLayout />}>
          <Route path="/client" element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path={ROUTES.CLIENT_HOME}             element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path={ROUTES.CLIENT_EXPLORE}          element={<ExploreServicePage />} />
          <Route path={ROUTES.CLIENT_PROVIDER_PROFILE} element={<ProviderPublicProfilePage />} />
          <Route path={ROUTES.CLIENT_BOOKING_CONFIRM}  element={<BookingConfirmationPage />} />
          <Route path={ROUTES.CLIENT_BOOKING_SENT}     element={<BookingRequestSentPage />} />
          <Route path={ROUTES.CLIENT_MY_BOOKINGS}      element={<MyBookingsPage />} />
          <Route path={ROUTES.CLIENT_BOOKING_PAY}      element={<BookingPaymentPage />} />
          <Route path={ROUTES.CLIENT_BOOKING_REVIEW}   element={<SubmitReviewPage />} />
          <Route path={ROUTES.CLIENT_PAYMENT_SUCCESS}  element={<PaymentSuccessPage />} />
          <Route path={ROUTES.CLIENT_PAYMENT_FAILED}   element={<PaymentFailedPage />} />
          <Route path={ROUTES.CLIENT_PROFILE}          element={<ClientProfilePage />} />
          <Route path={ROUTES.CLIENT_COMPLAINTS}       element={<ClientComplaintsPage />} />
        </Route>
      </Route>

      {/* ── System Admin layout ─────────────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={[ROLES.SYSTEM_ADMIN]} />}>
        <Route element={<SystemAdminLayout />}>
          <Route path="/admin/system" element={<Navigate to={ROUTES.SYSTEM_ADMIN_DASHBOARD} replace />} />

          <Route path={ROUTES.SYSTEM_ADMIN_DASHBOARD}     element={<SystemAdminDashboardPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_BOOKINGS}       element={<BookingManagementPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_USERS}          element={<UserManagementPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_CONTENT}        element={<ContentManagementPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_ANNOUNCEMENTS}  element={<AnnouncementsPage />} />
        </Route>
      </Route>

      {/* ── Verification Admin layout ───────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={[ROLES.VERIFICATION_ADMIN]} />}>
        <Route element={<VerificationAdminLayout />}>
          <Route path="/admin/verification" element={<Navigate to={ROUTES.VERIFICATION_ADMIN_DASHBOARD} replace />} />

          <Route path={ROUTES.VERIFICATION_ADMIN_DASHBOARD}  element={<VerificationDashboardPage />} />
          <Route path={ROUTES.VERIFICATION_ADMIN_REVIEW}     element={<VerificationReviewPage />} />
          <Route path={ROUTES.VERIFICATION_ADMIN_COMPLAINT}  element={<ComplaintReviewPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
