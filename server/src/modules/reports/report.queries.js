import { query } from '../../db/query.js';

export function getMonthRevenueSummary(year, month) {
  return query(
    `SELECT
       COUNT(*) FILTER (WHERE revenue_type = 'MEMBERSHIP') AS membership_payment_count,
       COALESCE(SUM(amount) FILTER (WHERE revenue_type = 'MEMBERSHIP'), 0) AS membership_income,
       COUNT(*) FILTER (WHERE revenue_type = 'CLIENT_PAYMENT_COMMISSION') AS card_payment_count,
       COALESCE(SUM(amount) FILTER (WHERE revenue_type = 'CLIENT_PAYMENT_COMMISSION'), 0) AS commission_income,
       COALESCE(SUM(amount), 0) AS total_income
     FROM revenue_entries
     WHERE EXTRACT(YEAR FROM recognized_at) = $1 AND EXTRACT(MONTH FROM recognized_at) = $2`,
    [year, month],
  );
}
