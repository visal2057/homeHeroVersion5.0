import { AppError } from '../../utils/AppError.js';
import {
  getProviderCategoryCount,
  getMembershipCount,
  getPricingRule,
} from './membership.queries.js';

// Work out what the provider's NEXT membership payment should be.
// The provider never types a price; the backend decides it from:
//   - how many categories they offer (1 or 2), and
//   - whether this is their first payment or a renewal.
export async function getMembershipQuote(providerUserId) {
  const { rows: catRows } = await getProviderCategoryCount(providerUserId);
  const categoryCount = catRows[0].count;
  if (categoryCount < 1) {
    throw new AppError('Select at least one service category before buying a membership', 422);
  }

  const { rows: countRows } = await getMembershipCount(providerUserId);
  const isFirstPayment = countRows[0].count === 0;

  const { rows: ruleRows } = await getPricingRule(categoryCount);
  if (ruleRows.length === 0) {
    throw new AppError('No membership pricing is configured for your number of categories', 500);
  }
  const rule = ruleRows[0];

  return {
    pricingRuleId: rule.membership_pricing_rule_id,
    categoryCount,
    isFirstPayment,
    paymentType: isFirstPayment ? 'FIRST_PAYMENT' : 'RENEWAL',
    amount: Number(isFirstPayment ? rule.first_payment_amount : rule.renewal_amount),
    durationMonths: rule.duration_months,
    graceDays: rule.grace_days,
  };
}
