import PDFDocument from 'pdfkit';
import { getMonthRevenueSummary } from './report.queries.js';

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

  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  doc.fontSize(20).fillColor('#047857').text('HomeHero Earnings Report', { align: 'left' });
  doc.fontSize(12).fillColor('#334155').text(`Reporting period: ${monthLabel}`);
  doc.moveDown(1);
  doc.strokeColor('#a7f3d0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  const rowsData = [
    ['Membership payment count', String(summary.membership_payment_count)],
    ['Membership income', formatCurrency(summary.membership_income)],
    ['Client card-payment count', String(summary.card_payment_count)],
    ['Commission income (5% platform fee)', formatCurrency(summary.commission_income)],
    ['Total income', formatCurrency(summary.total_income)],
  ];

  doc.fontSize(12).fillColor('#0f172a');
  rowsData.forEach(([label, value], index) => {
    const y = doc.y;
    if (index === rowsData.length - 1) {
      doc.font('Helvetica-Bold');
    }
    doc.text(label, 50, y, { continued: false });
    doc.text(value, 350, y);
    doc.moveDown(0.6);
  });

  doc.moveDown(1.5);
  doc.fontSize(9).fillColor('#64748b').text(`Generated on ${new Date().toLocaleString()}`, { align: 'left' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
