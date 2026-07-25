-- Mirrors the "opened" tracking that complaints already have
-- (complaints.opened_by_user_id / complaints.opened_at, migration 011) so a
-- pending Service Provider application can show the same
-- Unread -> Processing -> Resolved lifecycle on the Verification Admin
-- dashboard: unopened while opened_at is null, "Processing" once the admin
-- has viewed the application's documents, and resolved once
-- verification_status leaves PENDING (APPROVED/REJECTED).
ALTER TABLE sp_verification_applications ADD COLUMN IF NOT EXISTS opened_by_user_id bigint REFERENCES users(user_id);
ALTER TABLE sp_verification_applications ADD COLUMN IF NOT EXISTS opened_at timestamp with time zone;
