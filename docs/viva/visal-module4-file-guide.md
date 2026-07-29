# Module 4 — Payments & Memberships — Viva File Guide (Visal)

Everything you own, ranked by how likely you are to be asked to open it and explain it.
Backend is ~1,100 lines total, frontend ~1,600. It is genuinely small enough to know cold.

---

## Tier 1 — Know these line by line (5 files, ~580 lines)

If the panel says "show me where X happens", it is almost certainly in one of these.

### 1. `server/src/modules/payments/payment.service.js` (209 lines)
**The single most important file you own.** Contains:
- `assertPayable()` — the guard: booking exists, belongs to this client, is `ACCEPTED`, not already paid.
- `payWithCash()` — one insert, no fee, no revenue, no earning record.
- `payWithCard()` — charge first, then a **transaction** writing payment + commission revenue + provider earning together.
- `getProviderTotalEarningsSummary()` — the figure Maheli's dashboard displays.
- `getCardPaymentAmount()` — the locked amount Dinuka's invoice module reads.

### 2. `server/src/modules/memberships/membership.service.js` (187 lines)
- `getMembershipOverview()` — everything the Subscription page needs in one call.
- `purchaseMembership()` — blocks renewal while ACTIVE, charges, then a transaction: supersede old → insert membership → insert payment → insert revenue → restore online.
- `runMembershipExpiryCheck()` — expire → email → force offline after grace.

### 3. `server/src/modules/memberships/membershipPricing.service.js` (37 lines)
Small but a favourite viva target. The provider **never sends a price**; the backend derives it from
category count + whether this is the first payment, reading `membership_pricing_rules`.

### 4. `database/schema.sql` — the `booking_payments` table (around line 564)
```sql
platform_fee numeric(12,2) GENERATED ALWAYS AS (
  CASE WHEN payment_method = 'CARD' THEN round(service_amount * 0.05, 2)
       ELSE 0 END) STORED
```
**The 5% is a generated column — the database computes it, not JavaScript, not the browser.**
`total_amount` is generated the same way. Also note the `*_snapshot` columns (payee bank, client
name, provider name, category): the payment record keeps its own copy so a later profile edit can
never rewrite payment history.

### 5. `server/src/modules/payments/payment.queries.js` (89 lines)
All the SQL behind the above. Parameterised throughout.

---

## Tier 2 — Know what they do and be able to find things in them

| File | Why it matters |
|---|---|
| `payments/payment.routes.js` | 5 endpoints + `requireClient` / `requireProvider` guards |
| `memberships/membership.routes.js` | `GET /me`, `POST /purchase` |
| `payments/paymentGateway.service.js` | Simulated gateway. Cards starting `4000` are declined on purpose for the demo. Returns only a reference, brand and last four |
| `reviews/review.service.js` | Submitting the review is what flips the booking to `COMPLETED` and recalculates the average rating |
| `payment-settings/paymentSettings.service.js` | Bank details that autofill the payee section |
| `jobs/membershipExpiry.job.js` | The scheduled job that calls `runMembershipExpiryCheck()` |
| `database/migrations/007_membership_tables.sql` | Membership tables |
| `database/migrations/009_payment_and_review_tables.sql` | Payment + review tables |
| `database/migrations/019_notification_invoice_earning_tables.sql` | `provider_earnings` |

**Your tables:** `booking_payments`, `provider_earnings`, `revenue_entries`,
`membership_payments`, `provider_memberships`, `membership_pricing_rules`,
`provider_payment_settings`, `reviews`.

---

## Tier 3 — Frontend (know the flow, not every line)

| File | Role |
|---|---|
| `client/pages/BookingPaymentPage.jsx` (202) | The payment page — method selection, orchestration |
| `client/components/CardPaymentForm.jsx` (175) | Card fields + confirmation popup |
| `client/paymentMath.js` | Fee preview **for display only** — the backend recomputes it |
| `client/pages/SubmitReviewPage.jsx` (146) | Review after payment |
| `provider/pages/SubscriptionPage.jsx` (135) | Membership status, pricing, history |
| `provider/components/MembershipPaymentForm.jsx` (124) | Membership card payment |
| `provider/components/PaymentSettingsSection.jsx` (158) | Bank details form |

---

## Questions you should have a crisp answer to

**"Where is the 5% calculated?"**
In the database, as a `GENERATED ALWAYS ... STORED` column on `booking_payments`. The frontend
shows a preview for the user's benefit, but the stored figure is computed by Postgres from
`service_amount` and `payment_method`. A tampered frontend value cannot change what is recorded.

**"What stops a payment being recorded without revenue, or vice versa?"**
`payWithCard()` opens a transaction and writes the payment, the commission revenue row and the
provider earning row inside it, with `ROLLBACK` on any error. They cannot drift apart.

**"Why charge the card before the transaction?"**
So a declined card records nothing at all. The `AppError(..., 402)` is thrown before any insert.

**"Why is Cash different?"**
HomeHero never touches the money, so there is no commission, no earning record, and
`service_amount` is stored as `NULL`. The only record of a cash amount anywhere in the system is
the figure the provider types into their invoice — and that is explicitly not HomeHero-verified.

**"Where is the card number stored?"**
Nowhere. The gateway returns only a reference, brand and last four. The full number never leaves
the request. (See `paymentGateway.service.js`.)

**"What happens if the notification fails after a successful payment?"**
Nothing — it is wrapped in its own `try/catch` after the `COMMIT`, deliberately, so a notification
failure can never undo a payment. Same principle the spec applies to emails.

**"How does a provider get forced offline?"**
`runMembershipExpiryCheck()`, called by `membershipExpiry.job.js`: expire memberships past their
date and email those providers, then force offline anyone whose 3-day grace has also run out.
Renewing calls `restoreOnlineIfForcedOffline()` in the same transaction as the purchase.

**"Can a provider renew early and stack two memberships?"**
No. `purchaseMembership()` rejects with 409 while the current membership is `ACTIVE`.

**"How is the price decided?"**
`getMembershipQuote()` reads the category count and the number of past memberships, then looks up
`membership_pricing_rules`. LKR 4,999 for one category; for two, LKR 9,998 first payment and
LKR 7,498.50 per renewal. The client never sends an amount.

---

## Database objects you own

Verified against `database/schema.sql` and the live DB (`HomeHero_latest V10.backup`).

### Tables (8)

| Table | PK | Purpose |
|---|---|---|
| `booking_payments` | `booking_payment_id` | One row per paid booking, Cash or Card |
| `provider_earnings` | `provider_earning_id` | What the provider earns per Card payment |
| `revenue_entries` | `revenue_entry_id` | HomeHero's own income (commission + membership) |
| `provider_memberships` | `membership_id` | One row per membership period |
| `membership_payments` | `membership_payment_id` | The card payment for a membership |
| `membership_pricing_rules` | `membership_pricing_rule_id` | Reference data: 1-category and 2-category pricing |
| `provider_payment_settings` | `provider_user_id` | Provider bank details (payee autofill) |
| `reviews` | `review_id` | Client review; submitting it completes the booking |

### Generated columns — `booking_payments`

```sql
platform_fee  GENERATED ALWAYS AS (CASE WHEN payment_method='CARD'
                THEN round(service_amount*0.05,2) ELSE 0 END) STORED
total_amount  GENERATED ALWAYS AS (service_amount + platform_fee) STORED
```
The 5% and the total are computed and stored by Postgres. Application code writes neither —
`insertBookingPayment()` reads them back with `RETURNING`.

### CHECK constraints

| Constraint | Table | Rule |
|---|---|---|
| `chk_one_revenue_source` | `revenue_entries` | Exactly one of `booking_payment_id` / `membership_payment_id` is set |
| `revenue_entries_amount_check` | `revenue_entries` | `amount > 0` |
| `provider_earnings_amount_check` | `provider_earnings` | `amount > 0` |
| `chk_grace_after_expiry` | `provider_memberships` | `grace_ends_at >= expires_at` |
| `..._category_count_snapshot_check` | `provider_memberships` | Category count is 1 or 2 |
| `..._category_count_check` | `membership_pricing_rules` | Category count is 1 or 2 |
| `reviews_rating_check` | `reviews` | Rating between 1 and 5 |

### UNIQUE constraints — these are your real business rules

| Constraint | Enforces |
|---|---|
| `booking_payments_booking_id_key` | **One payment per booking** — double payment is impossible |
| `booking_payments_gateway_reference_key` | No duplicate gateway reference |
| `provider_earnings_booking_payment_id_key` | **One earning record per payment** |
| `membership_payments_membership_id_key` | One payment per membership |
| `membership_payments_gateway_reference_key` | No duplicate gateway reference |
| `provider_memberships_provider_user_id_membership_sequence_n_key` | Sequence numbers don't repeat per provider |
| `membership_pricing_rules_category_count_key` | One pricing rule per category count |
| `reviews_booking_id_key` | **One review per booking** |

### Indexes (14)

Partial unique indexes — the clever ones, worth calling out:

| Index | What it guarantees |
|---|---|
| `uix_one_active_membership` | `UNIQUE (provider_user_id) WHERE status='ACTIVE'` — a provider **cannot** hold two active memberships, enforced by the database, not just by the 409 check in `purchaseMembership()` |
| `uix_rev_booking_payment` | One commission revenue row per booking payment |
| `uix_rev_membership_payment` | One membership revenue row per membership payment |
| `uix_reviews_booking_id` | One review per booking |

Plain B-tree indexes:

| Index | Table (column) | Serves |
|---|---|---|
| `ix_bp_booking_id` | `booking_payments (booking_id)` | *(redundant — see gaps)* |
| `ix_bp_paid_at` | `booking_payments (paid_at)` | Date-range reporting |
| `ix_mpy_paid_at` | `membership_payments (paid_at)` | Date-range reporting |
| `ix_pe_provider_user_id` | `provider_earnings (provider_user_id)` | Total Earnings lookup |
| `ix_pm_provider_user_id` | `provider_memberships (provider_user_id)` | Membership lookup |
| `ix_pm_expires_at` | `provider_memberships (expires_at)` | Expiry job |
| `ix_pm_grace_ends_at` | `provider_memberships (grace_ends_at)` | Forced-offline job |
| `ix_pm_membership_status` | `provider_memberships (membership_status)` | Status filtering |
| `ix_rev_recognized_at` | `revenue_entries (recognized_at)` | Monthly revenue grouping (`vw_monthly_revenue`) |
| `ix_rev_revenue_type` | `revenue_entries (revenue_type)` | Splitting membership vs commission income |

### Foreign keys (10)

`booking_payments → bookings` · `provider_earnings → booking_payments, service_provider_profiles` ·
`revenue_entries → booking_payments, membership_payments` ·
`provider_memberships → service_provider_profiles, membership_pricing_rules` ·
`membership_payments → provider_memberships` ·
`provider_payment_settings → service_provider_profiles` · `reviews → bookings`

### Views you use

| View | Used by |
|---|---|
| `vw_current_provider_membership` | **Yours.** `DISTINCT ON (provider_user_id)` picks the latest membership and computes `is_in_grace_period`. Used by your `membership.queries.js` and also by Maheli and Vihas |
| `vw_monthly_revenue` | Reads **your** `revenue_entries`, splitting membership vs commission income per month. Feeds Vihas's 6-month chart and earnings report |

### Triggers, functions, stored procedures — **you own none**

The live database has exactly 6 trigger functions and 6 triggers, and **not one is on your tables**:
they belong to bookings, client/provider profiles, portfolio images and provider categories.

Be ready to say why, because it sounds like a gap and isn't:

> My module's invariants are enforced declaratively rather than procedurally — generated columns
> for the fee, partial unique indexes for "one active membership" and "one revenue row per
> payment", CHECK constraints for amounts and dates, and multi-statement writes wrapped in
> explicit transactions in the service layer. A trigger would have hidden that logic from the
> code that owns it.

**Trap to avoid:** `database/functions/purchase_membership.sql` and
`database/triggers/updated_at_triggers.sql` exist but are **0-byte placeholder files** — the whole
`database/functions/` and `database/triggers/` folders are empty scaffolding from early planning.
If a panelist opens `purchase_membership.sql` expecting a stored procedure, say plainly that the
folders were scaffolding and the logic lives in `membership.service.js` inside a transaction.

### Gaps I found

1. **`ix_bp_booking_id` is redundant.** `booking_payments.booking_id` already has a UNIQUE
   constraint, and Postgres creates an index for that automatically. This second index costs write
   time and storage for no gain. Safe to drop.
2. **`updated_at` has no trigger** on `provider_memberships` or `provider_payment_settings`.
   Not currently a bug — every `UPDATE` in your queries sets `updated_at = now()` by hand — but it
   depends on nobody forgetting. A `BEFORE UPDATE` trigger would make it structural. (This is what
   the empty `updated_at_triggers.sql` was meant to hold.)
3. Indexing is otherwise complete — every column your queries filter or join on is covered.

## One weak spot to be ready for

**There are no automated tests for this module** — `server/tests/` contains only `setup.js`.
If asked how you verified the payment logic, answer honestly: manual testing through the UI,
including the deliberate `4000...` decline card for the failure path. If you want to strengthen
this before the viva, the highest-value tests would be `getMembershipQuote()` (pure pricing logic,
easy to test) and `assertPayable()` (the payment guard).
