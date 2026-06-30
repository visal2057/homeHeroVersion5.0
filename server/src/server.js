import 'dotenv/config';
import app from './app.js';
import { startMembershipExpiryJob } from './jobs/membershipExpiry.job.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  // Background job (Module 4 - Visal): expire memberships + force offline after grace.
  startMembershipExpiryJob();
});
