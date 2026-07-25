-- Adds a provider-initiated reschedule-proposal workflow and a required
-- reason on plain provider rejections.
--
-- New terminal/awaiting statuses: RESCHEDULE_PENDING (SP proposed a new
-- date/time on a PENDING booking, awaiting the client's decision) and
-- RESCHEDULE_REJECTED (client rejected the proposal -- terminal, visible
-- only to System Admin). Enum values must be added in their own statement
-- before anything below can reference them.
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'RESCHEDULE_PENDING';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'RESCHEDULE_REJECTED';

-- The SP's proposed new window, applied to scheduled_at/scheduled_end_at
-- only once the client accepts (booking.service.js's acceptReschedule).
-- rejection_reason mirrors the existing cancellation_reason naming, but is
-- for a provider's plain reject rather than a client cancel.
ALTER TABLE public.bookings ADD COLUMN proposed_scheduled_at timestamp with time zone;
ALTER TABLE public.bookings ADD COLUMN proposed_scheduled_end_at timestamp with time zone;
ALTER TABLE public.bookings ADD COLUMN rejection_reason text;

-- Extends the booking status state machine: PENDING can now also move to
-- RESCHEDULE_PENDING (SP proposed a new time), which itself can only
-- resolve to ACCEPTED (client accepted) or the new terminal
-- RESCHEDULE_REJECTED (client rejected).
CREATE OR REPLACE FUNCTION public.trg_validate_booking_transition() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.booking_status = NEW.booking_status THEN RETURN NEW; END IF;
    IF OLD.booking_status IN ('REJECTED','CANCELLED','COMPLETED','RESCHEDULE_REJECTED') THEN
        RAISE EXCEPTION 'Cannot transition from terminal status %', OLD.booking_status;
    END IF;
    IF OLD.booking_status = 'PENDING' AND NEW.booking_status NOT IN ('ACCEPTED','REJECTED','CANCELLED','RESCHEDULE_PENDING') THEN
        RAISE EXCEPTION 'Invalid transition PENDING → %', NEW.booking_status;
    END IF;
    IF OLD.booking_status = 'RESCHEDULE_PENDING' AND NEW.booking_status NOT IN ('ACCEPTED','RESCHEDULE_REJECTED') THEN
        RAISE EXCEPTION 'Invalid transition RESCHEDULE_PENDING → %', NEW.booking_status;
    END IF;
    IF OLD.booking_status = 'ACCEPTED' AND NEW.booking_status NOT IN ('COMPLETED','CANCELLED') THEN
        RAISE EXCEPTION 'Invalid transition ACCEPTED → %', NEW.booking_status;
    END IF;
    RETURN NEW;
END;
$$;
