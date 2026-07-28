-- Lets a provider manually appear "online" on a specific day even though that
-- day falls inside one of their own unavailable_periods, without touching the
-- underlying period row - so the override expires on its own the next day
-- (see availability.service.js's getTodayStatus, which compares this column
-- to CURRENT_DATE rather than storing an "is active" boolean).
ALTER TABLE service_provider_profiles ADD COLUMN IF NOT EXISTS online_override_date date;
