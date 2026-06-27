import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.authSecret);
    req.user = payload;
    return next();
  } catch {
    return next(new AppError('Invalid or expired session', 401));
  }
}
