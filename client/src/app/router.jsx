import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import SystemAdminLayout from '../layouts/SystemAdminLayout.jsx';
import VerificationAdminLayout from '../layouts/VerificationAdminLayout.jsx';
import GuestRoute from '../components/routing/GuestRoute.jsx';
import RoleProtectedRoute from '../components/routing/RoleProtectedRoute.jsx';
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

import SystemAdminDashboardPage from '../features/admin/system/pages/SystemAdminDashboardPage.jsx';
import BookingManagementPage from '../features/admin/system/pages/BookingManagementPage.jsx';
import UserManagementPage from '../features/admin/system/pages/UserManagementPage.jsx';
import ContentManagementPage from '../features/admin/system/pages/ContentManagementPage.jsx';
import AnnouncementsPage from '../features/admin/system/pages/AnnouncementsPage.jsx';

import VerificationDashboardPage from '../features/admin/verification/pages/VerificationDashboardPage.jsx';
import VerificationReviewPage from '../features/admin/verification/pages/VerificationReviewPage.jsx';
import ComplaintReviewPage from '../features/admin/verification/pages/ComplaintReviewPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
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

      <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]} />}>
        <Route element={<SystemAdminLayout />}>
          <Route path={ROUTES.SYSTEM_ADMIN_DASHBOARD} element={<SystemAdminDashboardPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_BOOKINGS} element={<BookingManagementPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_USERS} element={<UserManagementPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_CONTENT} element={<ContentManagementPage />} />
          <Route path={ROUTES.SYSTEM_ADMIN_ANNOUNCEMENTS} element={<AnnouncementsPage />} />
        </Route>
      </Route>

      <Route element={<RoleProtectedRoute allowedRoles={[ROLES.VERIFICATION_ADMIN]} />}>
        <Route element={<VerificationAdminLayout />}>
          <Route path={ROUTES.VERIFICATION_ADMIN_DASHBOARD} element={<VerificationDashboardPage />} />
          <Route path={ROUTES.VERIFICATION_ADMIN_REVIEW} element={<VerificationReviewPage />} />
          <Route path={ROUTES.VERIFICATION_ADMIN_COMPLAINT} element={<ComplaintReviewPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
