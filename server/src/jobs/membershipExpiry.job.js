import { runMembershipExpiryCheck } from '../modules/memberships/membership.service.js';
import { logger } from '../utils/logger.js';

// How often to check for expired memberships. Once an hour is plenty for a
// monthly membership; the exact minute an expiry is processed does not matter.
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Run the check once and log the result. Errors are caught so a single bad
// run never crashes the server or stops future runs.
async function runOnce() {
  try {
    const result = await runMembershipExpiryCheck();
    if (result.expiredCount > 0 || result.forcedOfflineCount > 0) {
      logger.info('Membership expiry check:', result);
    }
  } catch (err) {
    logger.error('Membership expiry check failed', err.message);
  }
}

// Called once from server.js after the server starts.
export function startMembershipExpiryJob() {
  runOnce();                               // run immediately on startup
  setInterval(runOnce, CHECK_INTERVAL_MS); // then on a schedule
  logger.info('Membership expiry job started (runs hourly).');
}
