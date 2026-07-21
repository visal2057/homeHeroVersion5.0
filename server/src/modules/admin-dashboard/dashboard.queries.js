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

// Bookings grouped into Active (accepted, still in progress) vs Completed,
// so the dashboard pie/donut chart reflects booking lifecycle status.
export function bookingStatusDistribution() {
  return query(
    `SELECT
       COUNT(*) FILTER (WHERE booking_status = 'ACCEPTED') AS active_count,
       COUNT(*) FILTER (WHERE booking_status = 'COMPLETED') AS completed_count
     FROM bookings`,
  );
}
