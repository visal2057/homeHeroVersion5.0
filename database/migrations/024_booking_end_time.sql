-- Adds an end time alongside the existing scheduled_at (start time), so a
-- booking captures a start-end window instead of a single instant.
-- scheduled_end_at is nullable because existing bookings predate this
-- column; every new booking populates it via app-level validation
-- (booking.validation.js / booking.service.js), so no backfill or NOT NULL
-- is needed here.
ALTER TABLE public.bookings ADD COLUMN scheduled_end_at timestamp with time zone;

CREATE OR REPLACE VIEW public.vw_booking_overview AS
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
    b.scheduled_end_at
   FROM ((((public.bookings b
     JOIN public.users cu ON ((cu.user_id = b.client_user_id)))
     JOIN public.users pu ON ((pu.user_id = b.provider_user_id)))
     JOIN public.service_categories sc ON ((sc.service_category_id = b.service_category_id)))
     LEFT JOIN public.booking_payments bp ON ((bp.booking_id = b.booking_id));
