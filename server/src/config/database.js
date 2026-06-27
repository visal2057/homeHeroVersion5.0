import pg from 'pg';
import { env } from './environment.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error', err);
});
