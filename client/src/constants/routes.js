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

  // Client (authenticated)
  CLIENT_HOME: '/client/home',
  CLIENT_EXPLORE: '/client/explore/:category',
  CLIENT_PROVIDER_PROFILE: '/client/provider/:providerId',
  CLIENT_BOOKING_CONFIRM: '/client/booking/confirm/:providerId',
  CLIENT_BOOKING_SENT: '/client/booking/sent',
  CLIENT_MY_BOOKINGS: '/client/bookings',
  CLIENT_PROFILE: '/client/profile',
  CLIENT_COMPLAINTS: '/client/complaints',
};
