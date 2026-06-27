import { AppError } from '../utils/AppError.js';

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this page', 403));
    }
    return next();
  };
}
