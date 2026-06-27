import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME || 'homehero_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'vihas123',
  },

  authSecret: process.env.AUTH_SECRET || 'dev_secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret',
  sessionExpiryDays: Number(process.env.SESSION_EXPIRY_DAYS) || 7,
  passwordResetExpiryMinutes: Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES) || 30,

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'HomeHero <noreply@homehero.lk>',
  },

  membershipBasePrice: Number(process.env.MEMBERSHIP_BASE_PRICE) || 4999,
  clientPlatformFeePercentage: Number(process.env.CLIENT_PLATFORM_FEE_PERCENTAGE) || 5,
  membershipGraceDays: Number(process.env.MEMBERSHIP_GRACE_DAYS) || 3,

  publicStoragePath: process.env.PUBLIC_STORAGE_PATH || 'storage/public',
  privateStoragePath: process.env.PRIVATE_STORAGE_PATH || 'storage/private',
};
