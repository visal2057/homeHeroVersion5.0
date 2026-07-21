import { AppError } from '../utils/AppError.js';

// A Pending or Rejected Service Provider gets no provider functionality at
// all (system flow spec Section 20) -- only the waiting/rejected pages the
// client redirects them to after login. Safe to use on routes shared with
// other roles (e.g. requireProvider + requireSystemAdmin): non-providers are
// passed through untouched rather than blocked on a verification field they
// don't have.
export function checkProviderVerification(req, res, next) {
  if (req.user.role !== 'SERVICE_PROVIDER') {
    return next();
  }
  if (req.user.verificationStatus !== 'APPROVED') {
    return next(new AppError('Your Service Provider account is not yet verified', 403));
  }
  return next();
}
