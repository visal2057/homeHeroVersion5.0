-- Adds the notifications, invoices, and provider_earnings tables.
-- These already existed in database/schema.sql (dumped from a teammate's
-- environment) but were never captured as a migration, so this local dev
-- database was missing them even though the notifications/invoices modules
-- and their route handlers already assume they exist. Constraints below are
-- copied from schema.sql's actual ALTER TABLE ... ADD CONSTRAINT statements,
-- not re-derived, to stay faithful to the real design (e.g. invoices and
-- provider_earnings reference service_provider_profiles, not users, and
-- invoices/booking_payment_id both carry a real UNIQUE constraint that
-- invoice.service.js's 23505 handling and Visal's earnings logic depend on).

CREATE TABLE public.notifications (
    notification_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_user_id bigint NOT NULL REFERENCES public.users(user_id),
    title character varying(150) NOT NULL,
    message text NOT NULL,
    related_type character varying(40),
    related_id bigint,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX ix_notif_recipient_created ON public.notifications USING btree (recipient_user_id, created_at);
CREATE INDEX ix_notif_recipient_unread ON public.notifications USING btree (recipient_user_id, is_read);

CREATE TABLE public.invoices (
    invoice_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id bigint NOT NULL UNIQUE REFERENCES public.bookings(booking_id),
    provider_user_id bigint NOT NULL REFERENCES public.service_provider_profiles(provider_user_id),
    payment_method public.payment_method NOT NULL,
    amount numeric(12,2) NOT NULL,
    storage_path text NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoices_amount_check CHECK ((amount > (0)::numeric))
);

CREATE INDEX ix_inv_provider_user_id ON public.invoices USING btree (provider_user_id);

CREATE TABLE public.provider_earnings (
    provider_earning_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_payment_id bigint NOT NULL UNIQUE REFERENCES public.booking_payments(booking_payment_id),
    provider_user_id bigint NOT NULL REFERENCES public.service_provider_profiles(provider_user_id),
    amount numeric(12,2) NOT NULL,
    currency_code character(3) DEFAULT 'LKR'::bpchar NOT NULL,
    recognized_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT provider_earnings_amount_check CHECK ((amount > (0)::numeric))
);

CREATE INDEX ix_pe_provider_user_id ON public.provider_earnings USING btree (provider_user_id);
