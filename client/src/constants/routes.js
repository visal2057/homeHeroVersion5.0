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

  SYSTEM_ADMIN_DASHBOARD: '/admin/system/dashboard',
  SYSTEM_ADMIN_BOOKINGS: '/admin/system/bookings',
  SYSTEM_ADMIN_USERS: '/admin/system/users',
  SYSTEM_ADMIN_CONTENT: '/admin/system/content',
  SYSTEM_ADMIN_ANNOUNCEMENTS: '/admin/system/announcements',

  VERIFICATION_ADMIN_DASHBOARD: '/admin/verification/dashboard',
  VERIFICATION_ADMIN_REVIEW: '/admin/verification/applications/:applicationId',
  VERIFICATION_ADMIN_COMPLAINT: '/admin/verification/complaints/:complaintId',
};
