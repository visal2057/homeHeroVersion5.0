-- Invoice tables (Dinuka's module — Service Provider Invoice Generation)
--
-- Depends on tables owned by other modules that are not yet defined in this
-- repository: `bookings` (008_booking_tables.sql, owned by Tharinsa/Maheli's
-- booking flow) and `payments` (009_payment_and_review_tables.sql, owned by
-- Visal's payment module). Expected shape those tables will need to provide:
--   bookings(booking_id, client_id, provider_id, service_category_id,
--            description, location fields, booking_date, completion_date,
--            payment_method, status)
--   payments(booking_id, service_amount, payment_method)
--
-- The foreign keys below are left commented out so this migration can be run
-- on its own ahead of 008/009 landing. Once those tables exist, uncomment the
-- REFERENCES clauses (or add them via a follow-up migration).

CREATE TABLE IF NOT EXISTS invoices (
  invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE, -- REFERENCES bookings (booking_id)
  provider_id UUID NOT NULL, -- REFERENCES users (user_id)
  payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('CASH', 'CARD')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  pdf_storage_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_provider_id ON invoices (provider_id);
