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

  CONTENT: {
    SITE_IMAGES: '/content/site-images',
  },

  ANNOUNCEMENTS: {
    ACTIVE: '/announcements/active',
    LIST: '/announcements',
    CREATE: '/announcements',
    UPDATE: (id) => `/announcements/${id}`,
    ARCHIVE: (id) => `/announcements/${id}/archive`,
    MARK_READ: (id) => `/announcements/${id}/read`,
  },

  // Combined announcements + personal-notification feed for the Client and
  // Service Provider notification bells (owned by Vihas, consumed by
  // Tharinsa's and Maheli's header components).
  NOTIFICATIONS: {
    FEED: '/notifications/feed',
    MARK_READ: (type, id) => `/notifications/feed/${type}/${id}/read`,
  },

  SYSTEM_ADMIN: {
    DASHBOARD_OVERVIEW: '/system-admin/dashboard/overview',
    BOOKINGS: '/system-admin/bookings',
    USERS: '/system-admin/users',
    BAN_REQUESTS: '/system-admin/bans/requests',
    APPLY_BAN: '/system-admin/bans',
    REMOVE_BAN: (userBanId) => `/system-admin/bans/${userBanId}`,
    EARNINGS_REPORT: '/system-admin/reports/earnings',
    SP_TRACKING: '/system-admin/sp-tracking',
    SP_TRACKING_MVP: '/system-admin/sp-tracking/mvp',
  },

  VERIFICATION_ADMIN: {
    APPLICATIONS: '/verification-admin/verification/applications',
    APPLICATIONS_HISTORY: '/verification-admin/verification/applications/history',
    APPLICATION_DETAIL: (id) => `/verification-admin/verification/applications/${id}`,
    DOCUMENT: (id) => `/verification-admin/verification/documents/${id}`,
    APPROVE: (id) => `/verification-admin/verification/applications/${id}/approve`,
    REJECT: (id) => `/verification-admin/verification/applications/${id}/reject`,
    COMPLAINTS: '/verification-admin/complaints',
    COMPLAINTS_HISTORY: '/verification-admin/complaints/history',
    COMPLAINT_DETAIL: (id) => `/verification-admin/complaints/${id}`,
    COMPLAINT_VERDICT: (id) => `/verification-admin/complaints/${id}/verdict`,
  },

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
    INVOICE_FORM:       (bookingId) => `/provider/invoices/${bookingId}/form`,
    INVOICE_GENERATE:   (bookingId) => `/provider/invoices/${bookingId}`,
    INVOICE_DOWNLOAD:   (bookingId) => `/provider/invoices/${bookingId}/download`,
    EARNINGS_TOTAL:     '/payments/provider/earnings/total',
  },
};
