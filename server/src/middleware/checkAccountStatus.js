import { AppError } from '../utils/AppError.js';
import { findSessionValidity } from '../modules/auth/auth.queries.js';

// Chained onto the end of authenticate() so it runs on every authenticated
// request. login() already blocks a banned/deactivated user from signing
// in, but a JWT issued before the ban is otherwise still valid until it
// naturally expires -- this re-checks the DB so "Bans must invalidate
// active sessions" (spec Section 3.5/49) actually holds for sessions
// already in progress, not just new ones.
//
// Uses 401 (not 403) so the client's existing auto-logout-on-401
// interceptor clears the stale token immediately, the same way an expired
// token already does.
export async function checkAccountStatus(req, res, next) {
  try {
    const { rows } = await findSessionValidity(req.user.userId, req.user.sid);
    const row = rows[0];

    if (!row) {
      return next(new AppError('Your account no longer exists', 401));
    }
    if (row.account_status === 'DEACTIVATED') {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }
    if (row.ban_type) {
      const message =
        row.ban_type === 'TEMPORARY'
          ? `Your account is temporarily banned until ${new Date(row.ends_at).toLocaleString()}. Reason: ${row.reason}`
          : `Your account has been permanently banned. Reason: ${row.reason}`;
      return next(new AppError(message, 401));
    }
    // Only meaningful when the token carries a `sid` (every token issued
    // since logout was added). A logged-out session's row is revoked here,
    // so a JWT that is still cryptographically valid stops authenticating
    // the moment the user logs out, instead of lingering until it expires.
    if (req.user.sid && row.session_revoked_at) {
      return next(new AppError('Your session has ended. Please log in again.', 401));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
