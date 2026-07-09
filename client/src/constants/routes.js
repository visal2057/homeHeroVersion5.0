export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CAREERS: '/careers',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER_ROLE: '/register',
  REGISTER_CLIENT: '/register/client',
  REGISTER_PROVIDER: '/register/provider',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFICATION_PENDING: '/verification-pending',
  APPLICATION_REJECTED: '/application-rejected',
  PROVIDER_CREATE_INVOICE: '/provider/bookings/:bookingId/invoice',
};

export function providerCreateInvoiceRoute(bookingId) {
  return `/provider/bookings/${bookingId}/invoice`;
}
