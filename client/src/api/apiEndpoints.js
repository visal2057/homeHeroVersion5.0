export const API_ENDPOINTS = {
  AUTH: {
    REGISTER_CLIENT: '/auth/register/client',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  REGISTRATION: {
    REFERENCE: '/registration/reference',
    PROVIDER: '/registration/provider',
  },
  CONTACT: '/contact',

  PROVIDER: {
    PROFILE:            '/provider/profile',
    STATS:              '/provider/stats',
    AVAILABILITY:       '/provider/availability',
    UNAVAILABLE_DATES:  '/provider/unavailable-dates',
    BOOKINGS:           '/provider/bookings',
    BOOKING_ACCEPT:     (id) => `/provider/bookings/${id}/accept`,
    BOOKING_REJECT:     (id) => `/provider/bookings/${id}/reject`,
    JOBS:               '/provider/jobs',
    COMPLETED_JOBS:     '/provider/completed-jobs',
    REVIEWS:            '/provider/reviews',
    PORTFOLIO:          '/provider/portfolio',
    PORTFOLIO_DELETE:   (id) => `/provider/portfolio/${id}`,
    COMPLAINTS:         '/provider/complaints',
    ANNOUNCEMENTS:      '/provider/announcements',
  },
};
