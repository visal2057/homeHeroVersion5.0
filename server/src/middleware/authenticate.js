import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { AppError } from '../utils/AppError.js';
import { checkAccountStatus } from './checkAccountStatus.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, env.authSecret);
  } catch {
    return next(new AppError('Invalid or expired session', 401));
  }

  // A valid JWT only proves the session was legitimate at login. Re-check
  // the DB so a ban/deactivation applied since then takes effect on this
  // request instead of waiting for the token to expire naturally.
  return checkAccountStatus(req, res, next);
}
