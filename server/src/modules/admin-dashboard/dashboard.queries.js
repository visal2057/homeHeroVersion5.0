import { query } from '../../db/query.js';

export function currentMonthEarnings() {
  return query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE revenue_type = 'MEMBERSHIP'), 0) AS membership_income,
       COALESCE(SUM(amount) FILTER (WHERE revenue_type = 'CLIENT_PAYMENT_COMMISSION'), 0) AS commission_income,
       COALESCE(SUM(amount), 0) AS total_income
     FROM revenue_entries
     WHERE date_trunc('month', recognized_at) = date_trunc('month', now())`,
  );
}

export function activeBookingsCount() {
  return query(`SELECT COUNT(*) AS count FROM bookings WHERE booking_status = 'ACCEPTED'`);
}

export function verifiedProvidersCount() {
  return query(`SELECT COUNT(*) AS count FROM service_provider_profiles WHERE verification_status = 'APPROVED'`);
}

export function newClientsThisMonth() {
  return query(
    `SELECT COUNT(*) AS count FROM users u
     JOIN roles r ON r.role_id = u.role_id
     WHERE r.role_code = 'CLIENT' AND date_trunc('month', u.created_at) = date_trunc('month', now())`,
  );
}

export function lastSixMonthsRevenue() {
  return query(`SELECT * FROM vw_monthly_revenue ORDER BY revenue_year DESC, revenue_month DESC LIMIT 6`);
}

// Every Jobs-To-Do (Accepted) or Completed booking, grouped by service
// category, so the dashboard pie/donut chart shows what share of the
// platform's active + finished work belongs to each of the 5 categories.
// LEFT JOINed from service_categories so a category with zero such bookings
// still appears in the chart at 0% instead of silently disappearing.
export function bookingCategoryDistribution() {
  return query(
    `SELECT sc.category_code, sc.category_name,
            COUNT(b.booking_id) AS count
     FROM service_categories sc
     LEFT JOIN bookings b
       ON b.service_category_id = sc.service_category_id
       AND b.booking_status IN ('ACCEPTED', 'COMPLETED')
     GROUP BY sc.service_category_id, sc.category_code, sc.category_name
     ORDER BY sc.category_name`,
  );
}
