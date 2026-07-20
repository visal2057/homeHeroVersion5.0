import { getMonthRevenueSummary } from './report.queries.js';
import { buildEarningsReportPdfBuffer } from './earningsReportPdf.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCurrency(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function buildEarningsReportPdf({ year, month }) {
  const { rows } = await getMonthRevenueSummary(year, month);
  const summary = rows[0];

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  const rowsData = [
    { label: 'Membership payment count', value: String(summary.membership_payment_count) },
    { label: 'Membership income', value: formatCurrency(summary.membership_income) },
    { label: 'Client card-payment count', value: String(summary.card_payment_count) },
    { label: 'Commission income (5% platform fee)', value: formatCurrency(summary.commission_income) },
    { label: 'Total income', value: formatCurrency(summary.total_income) },
  ];

  return buildEarningsReportPdfBuffer({
    monthLabel,
    generatedAt: new Date().toLocaleString(),
    rows: rowsData,
  });
}
