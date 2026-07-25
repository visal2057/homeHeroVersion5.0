import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.resolve(__dirname, 'assets', 'homehero-logo.png');

const BRAND_GREEN = '#0f766e';
const BODY_COLOR = '#000000';
const MUTED_COLOR = '#6b7280';
const FOOTER_TEXT_COLOR = '#1f2937';
const FUNNEL_COLORS = { received: '#0ea5e9', accepted: '#0f766e', rejected: '#dc2626' };

const PAGE_MARGIN = 50;
const LOGO_SIZE = 60;
const HEADING_BAR_HEIGHT = 50;
const AVATAR_SIZE = 64;

function formatCurrency(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-LK', { dateStyle: 'medium' });
}

function drawLogo(doc) {
  if (!fs.existsSync(LOGO_PATH)) return;
  const logoX = (doc.page.width - LOGO_SIZE) / 2;
  doc.image(LOGO_PATH, logoX, PAGE_MARGIN, { fit: [LOGO_SIZE, LOGO_SIZE], align: 'center' });
}

// Full-width green band with the report title, in white, centered.
function drawHeadingBar(doc, barTop) {
  const pageWidth = doc.page.width;
  doc.rect(0, barTop, pageWidth, HEADING_BAR_HEIGHT).fill(BRAND_GREEN);
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#ffffff')
    .text('Service Provider Report', 0, barTop + HEADING_BAR_HEIGHT / 2 - 9, {
      align: 'center',
      width: pageWidth,
    });
}

// Circular avatar with the provider's photo, or their initial on a green
// disc when no photo has been uploaded -- mirrors the SP Tracking leaderboard
// card's fallback in MvpProvidersSection.jsx.
function drawAvatar(doc, x, y, imagePath, fallbackLetter) {
  doc.save();
  doc.circle(x + AVATAR_SIZE / 2, y + AVATAR_SIZE / 2, AVATAR_SIZE / 2).clip();
  if (imagePath) {
    doc.image(imagePath, x, y, { width: AVATAR_SIZE, height: AVATAR_SIZE });
  } else {
    doc.rect(x, y, AVATAR_SIZE, AVATAR_SIZE).fill(BRAND_GREEN);
  }
  doc.restore();
  if (!imagePath) {
    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#ffffff')
      .text(fallbackLetter, x, y + AVATAR_SIZE / 2 - 13, { width: AVATAR_SIZE, align: 'center' });
  }
}

// Avatar on the left, provider name/token/generated-date stacked beside it.
function drawProviderHeader(doc, provider, generatedAt, imagePath) {
  const top = doc.y;
  drawAvatar(doc, PAGE_MARGIN, top, imagePath, (provider.fullName ?? 'P')[0].toUpperCase());

  const textX = PAGE_MARGIN + AVATAR_SIZE + 16;
  doc.font('Helvetica-Bold').fontSize(16).fillColor(BODY_COLOR).text(provider.fullName, textX, top + 4);
  doc.font('Helvetica').fontSize(11).fillColor(MUTED_COLOR).text(provider.userToken, textX, doc.y + 2);
  doc.font('Helvetica').fontSize(9).fillColor(MUTED_COLOR).text(`Generated on ${generatedAt}`, textX, doc.y + 4);

  doc.x = PAGE_MARGIN;
  doc.y = top + AVATAR_SIZE + 20;
}

// 2x2 grid of bordered metric boxes, matching the on-screen stat cards.
function drawStatsGrid(doc, stats) {
  const gridWidth = doc.page.width - PAGE_MARGIN * 2;
  const gap = 12;
  const boxWidth = (gridWidth - gap) / 2;
  const boxHeight = 58;
  const top = doc.y;

  const cards = [
    { label: 'Completed Jobs', value: String(stats.completedJobs), sub: 'Lifetime completed bookings' },
    { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), sub: 'Card payments via HomeHero' },
    {
      label: 'Average Rating',
      value: stats.averageRating !== null ? stats.averageRating.toFixed(2) : '—',
      sub: `${stats.reviewCount} review${stats.reviewCount === 1 ? '' : 's'}`,
    },
    { label: 'Memberships Bought', value: String(stats.membershipsBought), sub: 'Lifetime membership purchases' },
  ];

  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PAGE_MARGIN + col * (boxWidth + gap);
    const y = top + row * (boxHeight + gap);

    doc.strokeColor(BRAND_GREEN).lineWidth(1).rect(x, y, boxWidth, boxHeight).stroke();
    doc.font('Helvetica').fontSize(9).fillColor(MUTED_COLOR).text(card.label, x + 12, y + 10);
    doc.font('Helvetica-Bold').fontSize(16).fillColor(BRAND_GREEN).text(card.value, x + 12, y + 24);
    doc.font('Helvetica').fontSize(8).fillColor(MUTED_COLOR).text(card.sub, x + 12, y + 43, { width: boxWidth - 24 });
  });

  doc.x = PAGE_MARGIN;
  doc.y = top + 2 * boxHeight + gap + 20;
}

// Horizontal bar chart of the booking funnel (Received/Accepted/Rejected),
// visually mirroring the BookingFunnelChart div-bars in SPTrackingStats.jsx.
function drawFunnelChart(doc, stats) {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BODY_COLOR).text('Booking Funnel', PAGE_MARGIN, doc.y);
  doc.moveDown(0.5);

  const rows = [
    { label: 'Received', value: stats.bookingsReceived, color: FUNNEL_COLORS.received },
    { label: 'Accepted', value: stats.bookingsAccepted, color: FUNNEL_COLORS.accepted },
    { label: 'Rejected', value: stats.bookingsRejected, color: FUNNEL_COLORS.rejected },
  ];
  const max = Math.max(stats.bookingsReceived, 1);

  const labelWidth = 70;
  const valueWidth = 40;
  const trackX = PAGE_MARGIN + labelWidth;
  const trackWidth = doc.page.width - PAGE_MARGIN * 2 - labelWidth - valueWidth;
  const barHeight = 14;
  const rowGap = 10;

  rows.forEach((row) => {
    const y = doc.y;
    doc.font('Helvetica').fontSize(10).fillColor(BODY_COLOR).text(row.label, PAGE_MARGIN, y + 2, { width: labelWidth - 6 });

    doc.rect(trackX, y, trackWidth, barHeight).fill('#e5e7eb');
    const width = row.value > 0 ? Math.max((row.value / max) * trackWidth, 4) : 0;
    if (width > 0) doc.rect(trackX, y, width, barHeight).fill(row.color);

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(BODY_COLOR)
      .text(String(row.value), trackX + trackWidth + 8, y + 2, { width: valueWidth - 8 });

    doc.y = y + barHeight + rowGap;
  });

  doc.x = PAGE_MARGIN;
  doc.moveDown(1);
}

const JOB_COLUMNS = [
  { key: 'bookingId', label: 'Booking ID', width: 60 },
  { key: 'clientName', label: 'Client', width: 115 },
  { key: 'serviceCategory', label: 'Category', width: 90 },
  { key: 'completionDate', label: 'Completed', width: 75 },
  { key: 'paymentMethod', label: 'Payment', width: 65 },
  { key: 'amount', label: 'Amount', width: 90 },
];

function jobCellText(job, key) {
  if (key === 'bookingId') return `#${job.bookingId}`;
  if (key === 'completionDate') return formatDate(job.completionDate);
  if (key === 'paymentMethod') return job.paymentMethod ?? '—';
  if (key === 'amount') return job.amount === null ? '—' : formatCurrency(job.amount);
  return job[key] ?? '—';
}

function drawJobsTableHeader(doc, tableX) {
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  doc.rect(tableX, y, JOB_COLUMNS.reduce((sum, c) => sum + c.width, 0), 22).fill(BRAND_GREEN);
  doc.fillColor('#ffffff');
  let x = tableX;
  JOB_COLUMNS.forEach((col) => {
    doc.text(col.label, x + 6, y + 6, { width: col.width - 10 });
    x += col.width;
  });
  doc.y = y + 22;
  doc.x = tableX;
}

// Completed-jobs table with automatic page breaks -- a busy provider's job
// history can easily overflow a single A4 page.
function drawJobsTable(doc, jobs) {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BODY_COLOR).text('Completed Jobs', PAGE_MARGIN, doc.y);
  doc.moveDown(0.5);

  const tableX = PAGE_MARGIN;
  const rowHeight = 20;
  const pageBottom = doc.page.height - PAGE_MARGIN;

  drawJobsTableHeader(doc, tableX);

  if (jobs.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(MUTED_COLOR).text('No completed jobs yet.', tableX + 6, doc.y + 6);
    doc.y += rowHeight;
    return;
  }

  jobs.forEach((job, i) => {
    if (doc.y + rowHeight > pageBottom) {
      doc.addPage();
      doc.y = PAGE_MARGIN;
      drawJobsTableHeader(doc, tableX);
    }

    const y = doc.y;
    if (i % 2 === 1) {
      doc.rect(tableX, y, JOB_COLUMNS.reduce((sum, c) => sum + c.width, 0), rowHeight).fill('#f3f4f6');
    }
    doc.font('Helvetica').fontSize(9).fillColor(BODY_COLOR);
    let x = tableX;
    JOB_COLUMNS.forEach((col) => {
      doc.text(jobCellText(job, col.key), x + 6, y + 5, { width: col.width - 10, ellipsis: true, lineBreak: false });
      x += col.width;
    });
    doc.y = y + rowHeight;
    doc.x = tableX;
  });
}

export function buildSpReportPdfBuffer({ provider, stats, jobs, generatedAt, profileImagePath }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    drawLogo(doc);

    const barTop = PAGE_MARGIN + LOGO_SIZE + 15;
    drawHeadingBar(doc, barTop);

    doc.x = PAGE_MARGIN;
    doc.y = barTop + HEADING_BAR_HEIGHT + 20;

    drawProviderHeader(doc, provider, generatedAt, profileImagePath);
    drawStatsGrid(doc, stats);
    drawFunnelChart(doc, stats);
    drawJobsTable(doc, jobs);

    doc.end();
  });
}
