import { query } from '../../db/query.js';

// The provider's latest membership (the view already picks the most recent one).
export function getCurrentMembership(providerUserId) {
  return query(
    `SELECT membership_id, membership_status, starts_at, expires_at, grace_ends_at,
            category_count_snapshot, is_in_grace_period
     FROM vw_current_provider_membership
     WHERE provider_user_id = $1`,
    [providerUserId],
  );
}

// How many service categories the provider offers (1 or 2). This decides the price.
export function getProviderCategoryCount(providerUserId) {
  return query(
    `SELECT count(*)::int AS count FROM provider_service_categories WHERE provider_user_id = $1`,
    [providerUserId],
  );
}

// How many memberships the provider has ever had. Zero means the next one is
// a first payment; otherwise it is a renewal.
export function getMembershipCount(providerUserId) {
  return query(
    `SELECT count(*)::int AS count FROM provider_memberships WHERE provider_user_id = $1`,
    [providerUserId],
  );
}

// The active pricing rule for a given category count.
export function getPricingRule(categoryCount) {
  return query(
    `SELECT membership_pricing_rule_id, category_count, first_payment_amount, renewal_amount,
            duration_months, grace_days
     FROM membership_pricing_rules
     WHERE category_count = $1 AND is_active = true`,
    [categoryCount],
  );
}

// Past memberships + their payment, newest first, for the history table.
export function getMembershipHistory(providerUserId) {
  return query(
    `SELECT pm.membership_id, pm.payment_type, pm.price_amount, pm.membership_status,
            pm.starts_at, pm.expires_at, pm.created_at,
            mp.amount_paid, mp.transaction_status, mp.gateway_reference, mp.card_last_four, mp.paid_at
     FROM provider_memberships pm
     LEFT JOIN membership_payments mp ON mp.membership_id = pm.membership_id
     WHERE pm.provider_user_id = $1
     ORDER BY pm.membership_sequence_number DESC`,
    [providerUserId],
  );
}

// Provider's name + email, for the confirmation email.
export function getProviderContact(providerUserId) {
  return query(`SELECT full_name, email FROM users WHERE user_id = $1`, [providerUserId]);
}

// ---- Writes (used by the purchase flow) ----

// A provider may only have ONE active membership (enforced by a unique index).
// So before activating a renewal, retire the current active one. Marking it
// EXPIRED is correct: the brand-new membership immediately takes over.
export function supersedeActiveMembership(executor, providerUserId) {
  return executor.query(
    `UPDATE provider_memberships
     SET membership_status = 'EXPIRED', updated_at = now()
     WHERE provider_user_id = $1 AND membership_status = 'ACTIVE'`,
    [providerUserId],
  );
}

// Insert the membership row, already ACTIVE, with its dates worked out from
// the pricing rule's duration and grace period.
export function insertActiveMembership(executor, m) {
  return executor.query(
    `INSERT INTO provider_memberships (
       provider_user_id, membership_pricing_rule_id, membership_sequence_number,
       payment_type, category_count_snapshot, price_amount, membership_status,
       starts_at, expires_at, grace_ends_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, 'ACTIVE',
       now(),
       now() + ($7 || ' months')::interval,
       now() + ($7 || ' months')::interval + ($8 || ' days')::interval
     )
     RETURNING membership_id, starts_at, expires_at, grace_ends_at`,
    [m.providerUserId, m.pricingRuleId, m.sequenceNumber, m.paymentType,
     m.categoryCount, m.amount, m.durationMonths, m.graceDays],
  );
}

export function insertMembershipPayment(executor, p) {
  return executor.query(
    `INSERT INTO membership_payments
       (membership_id, amount_paid, transaction_status, gateway_reference, card_brand, card_last_four, paid_at)
     VALUES ($1, $2, 'SUCCESS', $3, $4, $5, now())
     RETURNING membership_payment_id`,
    [p.membershipId, p.amount, p.gatewayReference, p.cardBrand, p.cardLastFour],
  );
}

export function insertMembershipRevenue(executor, membershipPaymentId, amount) {
  return executor.query(
    `INSERT INTO revenue_entries (revenue_type, membership_payment_id, amount, recognized_at)
     VALUES ('MEMBERSHIP', $1, $2, now())`,
    [membershipPaymentId, amount],
  );
}

// ---- Used by the scheduled expiry job ----

// Move each provider's current membership from ACTIVE to EXPIRED once its
// expiry date has passed. Returns who was expired so we can email them.
export function expireCurrentMemberships() {
  return query(
    `UPDATE provider_memberships pm
     SET membership_status = 'EXPIRED', updated_at = now()
     FROM vw_current_provider_membership cur
     WHERE pm.membership_id = cur.membership_id
       AND cur.membership_status = 'ACTIVE'
       AND cur.expires_at <= now()
     RETURNING pm.provider_user_id, pm.grace_ends_at`,
  );
}

// Once the 3-day grace has also passed with no renewal, force the provider
// offline so they stop receiving bookings (this is the "Forced Offline" rule).
export function forceOfflineAfterGrace() {
  return query(
    `UPDATE service_provider_profiles spp
     SET manual_online = false, updated_at = now()
     FROM vw_current_provider_membership cur
     WHERE spp.provider_user_id = cur.provider_user_id
       AND cur.membership_status = 'EXPIRED'
       AND cur.grace_ends_at < now()
       AND spp.manual_online = true
     RETURNING spp.provider_user_id`,
  );
}
