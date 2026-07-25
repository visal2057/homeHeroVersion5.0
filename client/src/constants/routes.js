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

  // Client
  CLIENT_HOME: '/client/home',
  CLIENT_EXPLORE: '/client/explore/:category',
  CLIENT_PROVIDER_PROFILE: '/client/providers/:providerId',
  CLIENT_BOOKING_CONFIRM: '/client/book/:providerId',
  CLIENT_BOOKING_SENT: '/client/booking-sent',
  CLIENT_MY_BOOKINGS: '/client/bookings',
  CLIENT_PROFILE: '/client/profile',
  CLIENT_COMPLAINTS: '/client/complaints',

  // Client payment + review (Module 4 - Visal)
  CLIENT_BOOKING_PAY: '/client/bookings/:bookingId/pay',
  CLIENT_BOOKING_REVIEW: '/client/bookings/:bookingId/review',
  CLIENT_PAYMENT_SUCCESS: '/client/bookings/:bookingId/success',
  CLIENT_PAYMENT_FAILED: '/client/bookings/:bookingId/failed',

  // Provider (Module 3)
  PROVIDER_DASHBOARD: '/provider/dashboard',
  PROVIDER_REQUESTS: '/provider/requests',
  PROVIDER_JOBS: '/provider/jobs',
  PROVIDER_COMPLETED: '/provider/completed',
  PROVIDER_SUBSCRIPTIONS: '/provider/subscriptions',
  PROVIDER_PROFILE: '/provider/profile',
  PROVIDER_COMPLAINTS: '/provider/complaints',
  PROVIDER_INVOICE: '/provider/completed/:bookingId/invoice',

  // System Admin
  SYSTEM_ADMIN_DASHBOARD: '/admin/system/dashboard',
  SYSTEM_ADMIN_BOOKINGS: '/admin/system/bookings',
  SYSTEM_ADMIN_SP_TRACKING: '/admin/system/sp-tracking',
  SYSTEM_ADMIN_USERS: '/admin/system/users',
  SYSTEM_ADMIN_CONTENT: '/admin/system/content',
  SYSTEM_ADMIN_ANNOUNCEMENTS: '/admin/system/announcements',

  // Verification Admin
  VERIFICATION_ADMIN_DASHBOARD: '/admin/verification/dashboard',
  VERIFICATION_ADMIN_APPLICATIONS: '/admin/verification/applications',
  VERIFICATION_ADMIN_REVIEW: '/admin/verification/applications/:applicationId',
  VERIFICATION_ADMIN_COMPLAINTS: '/admin/verification/complaints',
  VERIFICATION_ADMIN_COMPLAINT: '/admin/verification/complaints/:complaintId',
};
