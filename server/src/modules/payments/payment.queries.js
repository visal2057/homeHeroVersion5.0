import { query } from '../../db/query.js';

// One row with everything the payment screens need about a booking:
// who the provider/client are, the category, the provider's payee bank
// details, and whether a payment already exists for this booking.
export function getBookingPaymentContext(bookingId) {
  return query(
    `SELECT b.booking_id, b.booking_status, b.client_user_id, b.provider_user_id,
            pu.full_name AS provider_name,
            cu.full_name AS client_name,
            sc.category_name,
            pps.account_holder_name, pps.bank_name, pps.branch_name, pps.account_number_last_four,
            bp.booking_payment_id
     FROM bookings b
     JOIN users pu ON pu.user_id = b.provider_user_id
     JOIN users cu ON cu.user_id = b.client_user_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN provider_payment_settings pps ON pps.provider_user_id = b.provider_user_id
     LEFT JOIN booking_payments bp ON bp.booking_id = b.booking_id
     WHERE b.booking_id = $1`,
    [bookingId],
  );
}

// Insert the payment row. `executor` is either the pool (cash, single
// statement) or a transaction client (card, runs with the revenue insert).
// We do NOT calculate platform_fee/total here: the database computes them
// as generated columns, so we read them back with RETURNING.
export function insertBookingPayment(executor, p) {
  return executor.query(
    `INSERT INTO booking_payments (
       booking_id, payment_method, service_amount, payment_status,
       gateway_reference, card_brand, card_last_four,
       payee_account_last_four_snapshot, payee_bank_snapshot, payee_branch_snapshot, payee_name_snapshot,
       client_name_snapshot, provider_name_snapshot, category_name_snapshot, paid_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now())
     RETURNING booking_payment_id, service_amount, platform_fee, total_amount, payment_method, payment_status`,
    [
      p.bookingId, p.paymentMethod, p.serviceAmount, p.paymentStatus,
      p.gatewayReference, p.cardBrand, p.cardLastFour,
      p.payee?.lastFour ?? null, p.payee?.bank ?? null, p.payee?.branch ?? null, p.payee?.name ?? null,
      p.clientName, p.providerName, p.categoryName,
    ],
  );
}

// Record HomeHero's 5% commission as a revenue entry so Vihas can report it.
export function insertCommissionRevenue(executor, bookingPaymentId, amount) {
  return executor.query(
    `INSERT INTO revenue_entries (revenue_type, booking_payment_id, amount, recognized_at)
     VALUES ('CLIENT_PAYMENT_COMMISSION', $1, $2, now())`,
    [bookingPaymentId, amount],
  );
}

// Record what the provider themselves receives from a Card payment. This is
// separate from revenue_entries (HomeHero's own commission) -- it answers
// "what did the provider get", which Maheli's dashboard sums as Total
// Earnings via HomeHero, and Dinuka's invoice module reads per booking.
export function insertProviderEarning(executor, { bookingPaymentId, providerUserId, amount }) {
  return executor.query(
    `INSERT INTO provider_earnings (booking_payment_id, provider_user_id, amount, recognized_at)
     VALUES ($1, $2, $3, now())`,
    [bookingPaymentId, providerUserId, amount],
  );
}

// Sum of all Card-payment earnings for one provider -- the "Total Earnings
// via HomeHero" figure shown on the provider dashboard.
export function getProviderTotalEarnings(providerUserId) {
  return query(
    `SELECT COALESCE(SUM(amount), 0) AS total_earnings
     FROM provider_earnings
     WHERE provider_user_id = $1`,
    [providerUserId],
  );
}

// The locked Card-payment amount for one booking, read by Dinuka's invoice
// module to autofill and lock the invoice Amount field.
export function getCardPaymentAmountForBooking(bookingId) {
  return query(
    `SELECT bp.booking_id, bp.payment_method, bp.service_amount, b.provider_user_id
     FROM booking_payments bp
     JOIN bookings b ON b.booking_id = bp.booking_id
     WHERE bp.booking_id = $1`,
    [bookingId],
  );
}
