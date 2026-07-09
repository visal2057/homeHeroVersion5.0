import { runTemporaryBanExpiryCheck } from '../modules/bans/ban.service.js';
import { logger } from '../utils/logger.js';

// How often to check for temporary bans past their end date. A ban blocks
// login/access entirely, so this runs more often than the hourly
// membership job -- a user shouldn't stay locked out long past the ban's
// actual end time (spec §3.5 / clarification #11).
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// Run the check once and log the result. Errors are caught so a single bad
// run never crashes the server or stops future runs.
async function runOnce() {
  try {
    const result = await runTemporaryBanExpiryCheck();
    if (result.expiredCount > 0) {
      logger.info('Temporary ban expiry check:', result);
    }
  } catch (err) {
    logger.error('Temporary ban expiry check failed', err.message);
  }
}

// Called once from server.js after the server starts.
export function startTemporaryBanExpiryJob() {
  runOnce();                               // run immediately on startup
  setInterval(runOnce, CHECK_INTERVAL_MS); // then on a schedule
  logger.info('Temporary ban expiry job started (runs every 15 minutes).');
}
