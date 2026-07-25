-- Lets a Client store a Primary and a Secondary location instead of just
-- one. Registration only ever inserts a single row without specifying
-- location_type, so it keeps defaulting to PRIMARY with no change needed
-- to the registration flow itself.
ALTER TABLE client_locations ADD COLUMN IF NOT EXISTS location_type text NOT NULL DEFAULT 'PRIMARY';
ALTER TABLE client_locations ADD CONSTRAINT chk_client_location_type CHECK (location_type IN ('PRIMARY', 'SECONDARY'));
ALTER TABLE client_locations DROP CONSTRAINT IF EXISTS client_locations_client_user_id_key;
ALTER TABLE client_locations ADD CONSTRAINT client_locations_client_user_id_location_type_key UNIQUE (client_user_id, location_type);
