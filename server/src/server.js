import 'dotenv/config';
import app from './app.js';
import { ensureStorageDirs } from './config/ensureStorageDirs.js';
import { startMembershipExpiryJob } from './jobs/membershipExpiry.job.js';
import { startTemporaryBanExpiryJob } from './jobs/temporaryBanExpiry.job.js';
import { startScheduledAnnouncementsJob } from './jobs/scheduledAnnouncements.job.js';

ensureStorageDirs();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  startMembershipExpiryJob();
  startTemporaryBanExpiryJob();
  startScheduledAnnouncementsJob();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[ERROR] Port ${PORT} is already in use.\n` +
      `Another server process is still running. Stop it first:\n` +
      `  Windows: Run "npx kill-port ${PORT}" or close the other terminal.\n`
    );
  } else {
    console.error('[ERROR] Server failed to start:', err.message);
  }
  process.exit(1);
});
