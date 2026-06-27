import { pool } from './pool.js';

export function query(text, params) {
  return pool.query(text, params);
}
