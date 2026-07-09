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
  INVOICES: {
    FORM: (bookingId) => `/invoices/${bookingId}/form`,
    GENERATE: (bookingId) => `/invoices/${bookingId}`,
    DOWNLOAD: (bookingId) => `/invoices/${bookingId}/download`,
  },
};
