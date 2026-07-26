import { env } from './environment.js';

const allowedOrigins = env.clientUrl.split(',').map((origin) => origin.trim());

export const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
