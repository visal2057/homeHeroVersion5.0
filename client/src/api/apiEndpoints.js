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
  ANNOUNCEMENTS: {
    ACTIVE: '/announcements/active',
    LIST: '/announcements',
    CREATE: '/announcements',
    UPDATE: (id) => `/announcements/${id}`,
    ARCHIVE: (id) => `/announcements/${id}/archive`,
  },
  CONTENT: {
    SITE_IMAGES: '/content/site-images',
  },
  SYSTEM_ADMIN: {
    DASHBOARD_OVERVIEW: '/system-admin/dashboard/overview',
    BOOKINGS: '/system-admin/bookings',
    USERS: '/system-admin/users',
    BAN_REQUESTS: '/system-admin/bans/requests',
    APPLY_BAN: '/system-admin/bans',
    REMOVE_BAN: (userBanId) => `/system-admin/bans/${userBanId}`,
    EARNINGS_REPORT: '/system-admin/reports/earnings',
  },
  VERIFICATION_ADMIN: {
    APPLICATIONS: '/verification-admin/verification/applications',
    APPLICATION_DETAIL: (id) => `/verification-admin/verification/applications/${id}`,
    DOCUMENT: (id) => `/verification-admin/verification/documents/${id}`,
    APPROVE: (id) => `/verification-admin/verification/applications/${id}/approve`,
    REJECT: (id) => `/verification-admin/verification/applications/${id}/reject`,
    COMPLAINTS: '/verification-admin/complaints',
    COMPLAINT_DETAIL: (id) => `/verification-admin/complaints/${id}`,
    COMPLAINT_VERDICT: (id) => `/verification-admin/complaints/${id}/verdict`,
  },
};
