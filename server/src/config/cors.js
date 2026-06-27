import { env } from './environment.js';

export const corsOptions = {
  origin: env.clientUrl,
  credentials: true,
};
