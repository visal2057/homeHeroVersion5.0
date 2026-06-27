import {
  currentMonthEarnings,
  activeBookingsCount,
  verifiedProvidersCount,
  newClientsThisMonth,
  lastSixMonthsRevenue,
  bookingDistribution,
} from './dashboard.queries.js';
import { getRecentActions } from '../audit/audit.service.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function getDashboardOverview() {
  const [earningsRes, bookingsRes, providersRes, clientsRes, revenueRes, distributionRes, recentActions] =
    await Promise.all([
      currentMonthEarnings(),
      activeBookingsCount(),
      verifiedProvidersCount(),
      newClientsThisMonth(),
      lastSixMonthsRevenue(),
      bookingDistribution(),
      getRecentActions(10),
    ]);

  const earnings = earningsRes.rows[0];
  const distribution = distributionRes.rows[0];

  const revenueChart = revenueRes.rows
    .map((row) => ({
      label: `${MONTH_NAMES[row.revenue_month - 1]} ${row.revenue_year}`,
      year: row.revenue_year,
      month: row.revenue_month,
      membershipIncome: Number(row.membership_income),
      commissionIncome: Number(row.commission_income),
      totalIncome: Number(row.total_income),
    }))
    .reverse();

  return {
    metrics: {
      currentMonthEarnings: Number(earnings.total_income),
      membershipIncome: Number(earnings.membership_income),
      commissionIncome: Number(earnings.commission_income),
      activeBookings: Number(bookingsRes.rows[0].count),
      verifiedProviders: Number(providersRes.rows[0].count),
      newClientsThisMonth: Number(clientsRes.rows[0].count),
    },
    revenueChart,
    bookingDistribution: {
      active: Number(distribution.active_count),
      completed: Number(distribution.completed_count),
    },
    recentActions,
  };
}
