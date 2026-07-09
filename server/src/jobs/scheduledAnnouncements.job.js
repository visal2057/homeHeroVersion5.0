import { runScheduledAnnouncementPromotion } from '../modules/announcements/announcement.service.js';
import { logger } from '../utils/logger.js';

// How often to check for Scheduled announcements past their scheduled time.
// Runs more often than the ban/membership jobs since an announcement is
// scheduled to a specific minute (spec §39.1), not just a calendar day.
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

// Run the check once and log the result. Errors are caught so a single bad
// run never crashes the server or stops future runs.
async function runOnce() {
  try {
    const result = await runScheduledAnnouncementPromotion();
    if (result.promotedCount > 0) {
      logger.info('Scheduled announcement promotion:', result);
    }
  } catch (err) {
    logger.error('Scheduled announcement promotion failed', err.message);
  }
}

// Called once from server.js after the server starts.
export function startScheduledAnnouncementsJob() {
  runOnce();                               // run immediately on startup
  setInterval(runOnce, CHECK_INTERVAL_MS); // then on a schedule
  logger.info('Scheduled announcements job started (runs every minute).');
}
