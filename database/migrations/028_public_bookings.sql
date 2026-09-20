-- Public (broadcast) bookings: a client can request a booking without
-- naming a specific provider. It stays PENDING with provider_user_id NULL,
-- visible to every provider offering the category, until one of them
-- accepts it (first to accept wins and is written into provider_user_id).
--
-- The existing composite FK on (provider_user_id, service_category_id) uses
-- Postgres's default MATCH SIMPLE, so a NULL provider_user_id is exempt from
-- that check until a provider actually claims the row.

ALTER TABLE bookings ALTER COLUMN provider_user_id DROP NOT NULL;
ALTER TABLE bookings ADD COLUMN is_public_booking boolean NOT NULL DEFAULT false;

-- Lets one provider hide a public booking from their own Job Requests list
-- ("Not Interested") without affecting its visibility to any other provider
-- in the category -- the booking itself is untouched.
CREATE TABLE public_booking_dismissals (
    booking_id bigint NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    provider_user_id bigint NOT NULL REFERENCES service_provider_profiles(provider_user_id) ON DELETE CASCADE,
    dismissed_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (booking_id, provider_user_id)
);

-- vw_booking_overview (the client's own booking list) inner-joined users on
-- provider_user_id, which silently hid a still-unclaimed public booking from
-- the client's own Requests tab. Switch to a LEFT JOIN and surface
-- is_public_booking so the client can see and identify their own pending
-- public request before any provider has accepted it.
CREATE OR REPLACE VIEW vw_booking_overview AS
 SELECT b.booking_id,
    b.client_user_id,
    cu.full_name AS client_name,
    cu.user_token AS client_token,
    b.provider_user_id,
    pu.full_name AS provider_name,
    pu.user_token AS provider_token,
    sc.category_name AS service_category,
    b.scheduled_at,
    b.booking_status,
    bp.payment_method,
    bp.payment_status,
    b.requested_at,
    b.completed_at,
    b.scheduled_end_at,
    b.is_public_booking
   FROM (((bookings b
     JOIN users cu ON (cu.user_id = b.client_user_id))
     LEFT JOIN users pu ON (pu.user_id = b.provider_user_id))
     JOIN service_categories sc ON (sc.service_category_id = b.service_category_id))
     LEFT JOIN booking_payments bp ON (bp.booking_id = b.booking_id);
