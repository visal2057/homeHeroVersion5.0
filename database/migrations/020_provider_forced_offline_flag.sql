-- Tracks whether a provider's current offline state was imposed by the system
-- (membership grace period lapsing) rather than chosen by the provider, so
-- that renewing a lapsed membership can restore the provider's own online
-- preference automatically instead of leaving them stuck offline until they
-- manually flip the toggle again.
ALTER TABLE service_provider_profiles ADD COLUMN IF NOT EXISTS forced_offline boolean NOT NULL DEFAULT false;
