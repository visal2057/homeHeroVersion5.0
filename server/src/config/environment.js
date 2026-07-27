import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // CLIENT_URL may hold a comma-separated list (for CORS to allow multiple
  // origins - see cors.js). Anything building an actual link (password
  // reset, email CTAs) needs a single URL, so it always takes the first one.
  primaryClientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, ''),

  db: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME || 'homehero_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '1234',
  },

  authSecret: process.env.AUTH_SECRET || 'dev_secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret',
  sessionExpiryDays: Number(process.env.SESSION_EXPIRY_DAYS) || 7,
  passwordResetExpiryMinutes: Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES) || 30,

  // Sent over Resend's HTTPS API rather than raw SMTP -- most PaaS hosts
  // (Railway included) block outbound SMTP ports to prevent spam abuse,
  // which made direct SMTP delivery hang until connection timeout.
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'HomeHero <onboarding@resend.dev>',
  },

  // Inbox that receives Contact Us form submissions.
  contactNotificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL,

  membershipBasePrice: Number(process.env.MEMBERSHIP_BASE_PRICE) || 4999,
  clientPlatformFeePercentage: Number(process.env.CLIENT_PLATFORM_FEE_PERCENTAGE) || 5,
  membershipGraceDays: Number(process.env.MEMBERSHIP_GRACE_DAYS) || 3,

  publicStoragePath: process.env.PUBLIC_STORAGE_PATH || 'storage/public',
  privateStoragePath: process.env.PRIVATE_STORAGE_PATH || 'storage/private',
};
