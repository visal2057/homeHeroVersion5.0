import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import GuestRoute from '../components/routing/GuestRoute.jsx';
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

import CreateInvoicePage from '../features/provider/pages/CreateInvoicePage.jsx';

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

      {/* Provider shell (layout/sidebar/dashboard) isn't built yet — this
          route is registered standalone so the invoice flow is reachable in
          the meantime. Once ProviderLayout exists, nest this under it. */}
      <Route element={<RoleRoute allowedRoles={[ROLES.SERVICE_PROVIDER]} />}>
        <Route path={ROUTES.PROVIDER_CREATE_INVOICE} element={<CreateInvoicePage />} />
      </Route>
    </Routes>
  );
}
