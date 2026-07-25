import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.resolve(__dirname, 'assets', 'homehero-logo.png');

const BRAND_GREEN = '#0f766e';
const INVOICE_NUMBER_COLOR = '#111827';
const BODY_COLOR = '#000000';
const CLOSING_TEXT_COLOR = '#1f2937';

const PAGE_MARGIN = 50;
const HEADER_BAND_HEIGHT = 80;
const CLOSING_LINE = 'Thank you for choosing HomeHero.';

function formatInvoiceNumber(bookingId) {
  return `INV-${String(bookingId).padStart(6, '0')}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDateRange(start, end) {
  if (!start) return '-';
  if (!end) return formatDate(start);
  const startLabel = formatDate(start);
  const endLabel = new Date(end).toLocaleTimeString('en-LK', { timeStyle: 'short' });
  return `${startLabel} - ${endLabel}`;
}

// Full-bleed green band across the top of the page with the HomeHero
// wordmark centered inside it, in white.
function drawHeaderBand(doc) {
  const pageWidth = doc.page.width;
  doc.rect(0, 0, pageWidth, HEADER_BAND_HEIGHT).fill(BRAND_GREEN);
  doc
    .font('Helvetica-Bold')
    .fontSize(26)
    .fillColor('#ffffff')
    .text('HomeHero', 0, HEADER_BAND_HEIGHT / 2 - 13, { align: 'center', width: pageWidth });
}

// A two-column, green-bordered table (label | value), with black text and a
// green divider between rows/columns. Each row grows to fit its own wrapped
// text, so a long job description (always the last row) doesn't clip.
function drawInvoiceTable(doc, rows) {
  const tableX = PAGE_MARGIN;
  const tableWidth = doc.page.width - PAGE_MARGIN * 2;
  const labelColWidth = 150;
  const valueColWidth = tableWidth - labelColWidth;
  const cellPaddingX = 10;
  const cellPaddingY = 8;

  const tableTop = doc.y;

  const rowHeights = rows.map((r) => {
    const labelHeight = doc.font('Helvetica-Bold').fontSize(10).heightOfString(r.label, { width: labelColWidth - cellPaddingX * 2 });
    const valueHeight = doc.font('Helvetica').fontSize(10).heightOfString(r.value ?? '-', { width: valueColWidth - cellPaddingX * 2 });
    return Math.max(labelHeight, valueHeight) + cellPaddingY * 2;
  });

  let y = tableTop;
  rows.forEach((r, i) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(BODY_COLOR)
      .text(r.label, tableX + cellPaddingX, y + cellPaddingY, { width: labelColWidth - cellPaddingX * 2 });
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(BODY_COLOR)
      .text(r.value ?? '-', tableX + labelColWidth + cellPaddingX, y + cellPaddingY, { width: valueColWidth - cellPaddingX * 2 });
    y += rowHeights[i];
  });
  const tableBottom = y;

  // Borders are drawn last, once the total height is known.
  doc.strokeColor(BRAND_GREEN).lineWidth(1);
  doc.rect(tableX, tableTop, tableWidth, tableBottom - tableTop).stroke();
  doc.moveTo(tableX + labelColWidth, tableTop).lineTo(tableX + labelColWidth, tableBottom).stroke();
  let dividerY = tableTop;
  rowHeights.slice(0, -1).forEach((h) => {
    dividerY += h;
    doc.moveTo(tableX, dividerY).lineTo(tableX + tableWidth, dividerY).stroke();
  });

  doc.x = PAGE_MARGIN;
  doc.y = tableBottom;
}

export function writeInvoicePdf(destinationPath, invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
    const stream = fs.createWriteStream(destinationPath);

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.pipe(stream);

    drawHeaderBand(doc);

    doc.x = PAGE_MARGIN;
    doc.y = HEADER_BAND_HEIGHT + 30;

    doc.font('Helvetica-Bold').fontSize(24).fillColor(BRAND_GREEN).text('Invoice', PAGE_MARGIN, doc.y);
    doc.moveDown(0.3);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(INVOICE_NUMBER_COLOR)
      .text(`Invoice No: ${formatInvoiceNumber(invoice.bookingId)}`, PAGE_MARGIN, doc.y);

    doc.moveDown(1.5);

    drawInvoiceTable(doc, [
      { label: 'Booking ID', value: String(invoice.bookingId) },
      { label: 'Service Provider', value: invoice.providerName },
      { label: 'Service Category', value: invoice.serviceCategory },
      { label: 'Client', value: invoice.clientName },
      { label: 'Job Location', value: invoice.jobLocation },
      { label: 'Booking Date', value: formatDateRange(invoice.scheduledAt, invoice.scheduledEndAt) },
      { label: 'Completion Date', value: formatDate(invoice.completedAt) },
      { label: 'Payment Method', value: invoice.paymentMethod },
      { label: 'Job Description', value: invoice.jobDescription },
    ]);

    doc.moveDown(1);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(BRAND_GREEN)
      .text(`Total Amount Paid: LKR ${Number(invoice.amount).toFixed(2)}`, PAGE_MARGIN, doc.y);

    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).fillColor(CLOSING_TEXT_COLOR).text(CLOSING_LINE, PAGE_MARGIN, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).fillColor(CLOSING_TEXT_COLOR).text(invoice.providerName, PAGE_MARGIN, doc.y);

    doc.moveDown(2.5);
    if (fs.existsSync(LOGO_PATH)) {
      const logoSize = 90;
      const logoX = (doc.page.width - logoSize) / 2;
      doc.image(LOGO_PATH, logoX, doc.y, { fit: [logoSize, logoSize], align: 'center' });
    }

    doc.end();
  });
}
