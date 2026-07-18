import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { processCardPayment } from '../payments/paymentGateway.service.js';
import { getMembershipQuote } from './membershipPricing.service.js';
import { sendMembershipConfirmationEmail, sendMembershipExpiryEmail } from './membershipEmails.js';
import { logAction } from '../audit/audit.service.js';
import {
  getCurrentMembership,
  getMembershipHistory,
  getMembershipCount,
  getProviderContact,
  supersedeActiveMembership,
  insertActiveMembership,
  insertMembershipPayment,
  insertMembershipRevenue,
  expireCurrentMemberships,
  forceOfflineAfterGrace,
  restoreOnlineIfForcedOffline,
} from './membership.queries.js';

// Turn a history row into the shape the table on the page expects.
function toHistoryShape(row) {
  return {
    membershipId: row.membership_id,
    paymentType: row.payment_type,
    amount: Number(row.amount_paid ?? row.price_amount),
    status: row.membership_status,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    reference: row.gateway_reference,
    cardLastFour: row.card_last_four,
  };
}

// Everything the Subscription page needs in one call:
//   - the current membership (status, dates) or null
//   - the price of the next payment (the "quote")
//   - the payment history
export async function getMembershipOverview(providerUserId) {
  const { rows: currentRows } = await getCurrentMembership(providerUserId);
  const { rows: historyRows } = await getMembershipHistory(providerUserId);

  // The quote can fail if no category is selected yet; that should not stop
  // the page loading, so we treat it as "no quote available".
  let quote = null;
  try {
    quote = await getMembershipQuote(providerUserId);
  } catch {
    quote = null;
  }

  const current = currentRows[0];
  return {
    current: current
      ? {
          status: current.membership_status,
          startsAt: current.starts_at,
          expiresAt: current.expires_at,
          graceEndsAt: current.grace_ends_at,
          categoryCount: current.category_count_snapshot,
          isInGracePeriod: current.is_in_grace_period,
        }
      : null,
    quote,
    history: historyRows.map(toHistoryShape),
  };
}

// Buy or renew a membership by card. The price is decided by the backend
// (the quote), never sent by the provider. Payment, membership and revenue
// are written together in one transaction; the email is sent after it commits.
export async function purchaseMembership(input, providerUserId) {
  // 0. Block buying a new membership while the current one is still active.
  //    Renewal is only allowed once it has expired (during grace or after),
  //    so a provider can never pay twice for overlapping periods.
  const { rows: currentRows } = await getCurrentMembership(providerUserId);
  const current = currentRows[0];
  if (current && current.membership_status === 'ACTIVE') {
    const until = new Date(current.expires_at).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
    throw new AppError(`Your membership is still active until ${until}. You can renew once it has expired.`, 409);
  }

  // 1. Work out the correct price and terms.
  const quote = await getMembershipQuote(providerUserId);

  // 2. The sequence number is "how many memberships they've had" + 1.
  const { rows: countRows } = await getMembershipCount(providerUserId);
  const sequenceNumber = countRows[0].count + 1;

  // 3. Charge the card first; if it fails we record nothing.
  const charge = processCardPayment({ cardNumber: input.cardNumber, cardholderName: input.cardholderName });
  if (!charge.success) {
    throw new AppError('Your card was declined. Please try another card.', 402);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Retire any current active membership first (a provider can only have one).
    await supersedeActiveMembership(client, providerUserId);

    const { rows: membershipRows } = await insertActiveMembership(client, {
      providerUserId,
      pricingRuleId: quote.pricingRuleId,
      sequenceNumber,
      paymentType: quote.paymentType,
      categoryCount: quote.categoryCount,
      amount: quote.amount,
      durationMonths: quote.durationMonths,
      graceDays: quote.graceDays,
    });
    const membership = membershipRows[0];

    const { rows: paymentRows } = await insertMembershipPayment(client, {
      membershipId: membership.membership_id,
      amount: quote.amount,
      gatewayReference: charge.reference,
      cardBrand: charge.brand,
      cardLastFour: charge.lastFour,
    });

    // The full membership fee is HomeHero revenue.
    await insertMembershipRevenue(client, paymentRows[0].membership_payment_id, quote.amount);

    // If this renewal is what's ending a Forced Offline period, restore the
    // provider's online status automatically (spec: "Forced Offline is
    // removed... Go Online function becomes usable again").
    await restoreOnlineIfForcedOffline(client, providerUserId);

    await client.query('COMMIT');

    // 4. Email the provider their confirmation (after the data is safely saved).
    const { rows: contactRows } = await getProviderContact(providerUserId);
    if (contactRows[0]) {
      await sendMembershipConfirmationEmail(contactRows[0], {
        paymentType: quote.paymentType,
        amount: quote.amount,
        expiresAt: membership.expires_at,
      });
    }

    await logAction({
      actorUserId: providerUserId,
      actionCode: 'MEMBERSHIP_PURCHASED',
      entityType: 'provider_membership',
      entityId: membership.membership_id,
      description: `${contactRows[0]?.full_name ?? 'A Service Provider'} ${quote.paymentType === 'RENEWAL' ? 'renewed their' : 'purchased a new'} membership`,
      metadata: { amount: quote.amount, paymentType: quote.paymentType },
    });

    return {
      membershipId: membership.membership_id,
      status: 'ACTIVE',
      paymentType: quote.paymentType,
      amount: quote.amount,
      expiresAt: membership.expires_at,
      reference: charge.reference,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Run by the scheduled job. Two steps, in order:
//   1. Expire memberships whose date has passed (and email those providers).
//   2. Force offline any provider whose grace period has also run out.
// Returns counts so the job can log what it did.
export async function runMembershipExpiryCheck() {
  const { rows: expiredRows } = await expireCurrentMemberships();

  // Email each newly-expired provider about their grace period.
  for (const row of expiredRows) {
    const { rows: contactRows } = await getProviderContact(row.provider_user_id);
    if (contactRows[0]) {
      await sendMembershipExpiryEmail(contactRows[0], { graceEndsAt: row.grace_ends_at });
    }
  }

  const { rows: offlinedRows } = await forceOfflineAfterGrace();

  return { expiredCount: expiredRows.length, forcedOfflineCount: offlinedRows.length };
}
