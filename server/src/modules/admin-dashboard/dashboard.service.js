import {
  currentMonthEarnings,
  activeBookingsCount,
  verifiedProvidersCount,
  newClientsThisMonth,
  lastSixMonthsRevenue,
  categoryBookingDistribution,
} from './dashboard.queries.js';
import { getRecentActions } from '../audit/audit.service.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Builds the trailing 6 calendar months (oldest first, current month last),
// so the revenue chart always shows 6 bars - even for months with no
// recognized revenue yet - and the current month always lands on the right.
function buildTrailingSixMonths() {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

export async function getDashboardOverview() {
  const [earningsRes, bookingsRes, providersRes, clientsRes, revenueRes, categoryRes, recentActions] =
    await Promise.all([
      currentMonthEarnings(),
      activeBookingsCount(),
      verifiedProvidersCount(),
      newClientsThisMonth(),
      lastSixMonthsRevenue(),
      categoryBookingDistribution(),
      getRecentActions(10),
    ]);

  const earnings = earningsRes.rows[0];

  const revenueByMonth = new Map(revenueRes.rows.map((row) => [`${row.revenue_year}-${row.revenue_month}`, row]));

  const revenueChart = buildTrailingSixMonths().map(({ year, month }) => {
    const row = revenueByMonth.get(`${year}-${month}`);
    return {
      label: `${MONTH_NAMES[month - 1]} ${year}`,
      year,
      month,
      membershipIncome: row ? Number(row.membership_income) : 0,
      commissionIncome: row ? Number(row.commission_income) : 0,
      totalIncome: row ? Number(row.total_income) : 0,
    };
  });

  const totalCategoryBookings = categoryRes.rows.reduce((sum, row) => sum + Number(row.booking_count), 0);
  const categoryDistribution = categoryRes.rows.map((row) => ({
    categoryId: row.service_category_id,
    categoryName: row.category_name,
    count: Number(row.booking_count),
    percentage: totalCategoryBookings > 0 ? Math.round((Number(row.booking_count) / totalCategoryBookings) * 1000) / 10 : 0,
  }));

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
    categoryDistribution,
    recentActions,
  };
}
