-- Membership pricing rules (Module 4 - Visal)
-- One row per allowed category count. Prices come straight from the spec:
--   1 category : LKR 4,999 first payment and renewals
--   2 categories: LKR 9,998 first payment (4,999 x 2),
--                  LKR 7,498.50 renewals (4,999 x 1.5)
-- Duration is 1 month with a 3-day grace period after expiry.
--
-- Written with WHERE NOT EXISTS so running the seed twice is safe
-- (the id column is generated, so we must not insert it ourselves).

INSERT INTO membership_pricing_rules
  (category_count, first_payment_amount, renewal_amount, duration_months, grace_days)
SELECT 1, 4999.00, 4999.00, 1, 3
WHERE NOT EXISTS (
  SELECT 1 FROM membership_pricing_rules WHERE category_count = 1
);

INSERT INTO membership_pricing_rules
  (category_count, first_payment_amount, renewal_amount, duration_months, grace_days)
SELECT 2, 9998.00, 7498.50, 1, 3
WHERE NOT EXISTS (
  SELECT 1 FROM membership_pricing_rules WHERE category_count = 2
);
