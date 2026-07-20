import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.resolve(__dirname, 'assets', 'homehero-logo.png');

const BRAND_GREEN = '#0f766e';
const BODY_COLOR = '#000000';
const TOTAL_ROW_COLOR = '#0f766e';
const FOOTER_TEXT_COLOR = '#1f2937';

const PAGE_MARGIN = 50;
const LOGO_SIZE = 90;
const HEADING_BAR_HEIGHT = 50;

function drawLogo(doc) {
  if (!fs.existsSync(LOGO_PATH)) return;
  const logoX = (doc.page.width - LOGO_SIZE) / 2;
  doc.image(LOGO_PATH, logoX, PAGE_MARGIN, { fit: [LOGO_SIZE, LOGO_SIZE], align: 'center' });
}

// Full-width green band with the report title, in white, centered.
function drawHeadingBar(doc, monthLabel, barTop) {
  const pageWidth = doc.page.width;
  doc.rect(0, barTop, pageWidth, HEADING_BAR_HEIGHT).fill(BRAND_GREEN);
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#ffffff')
    .text(`Earnings Report - ${monthLabel}`, 0, barTop + HEADING_BAR_HEIGHT / 2 - 9, {
      align: 'center',
      width: pageWidth,
    });
}

// A two-column, green-bordered table (label | value), matching the invoice
// table styling. The final row (Total income) is emphasized in bold green.
function drawEarningsTable(doc, rows) {
  const tableX = PAGE_MARGIN;
  const tableWidth = doc.page.width - PAGE_MARGIN * 2;
  const labelColWidth = 320;
  const valueColWidth = tableWidth - labelColWidth;
  const cellPaddingX = 10;
  const cellPaddingY = 8;

  const tableTop = doc.y;

  const rowHeights = rows.map((r) => {
    const labelHeight = doc.font('Helvetica-Bold').fontSize(11).heightOfString(r.label, { width: labelColWidth - cellPaddingX * 2 });
    const valueHeight = doc.font('Helvetica').fontSize(11).heightOfString(r.value, { width: valueColWidth - cellPaddingX * 2 });
    return Math.max(labelHeight, valueHeight) + cellPaddingY * 2;
  });

  let y = tableTop;
  rows.forEach((r, i) => {
    const isTotalRow = i === rows.length - 1;
    const valueFont = isTotalRow ? 'Helvetica-Bold' : 'Helvetica';
    const textColor = isTotalRow ? TOTAL_ROW_COLOR : BODY_COLOR;

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(textColor)
      .text(r.label, tableX + cellPaddingX, y + cellPaddingY, { width: labelColWidth - cellPaddingX * 2 });
    doc
      .font(valueFont)
      .fontSize(11)
      .fillColor(textColor)
      .text(r.value, tableX + labelColWidth + cellPaddingX, y + cellPaddingY, { width: valueColWidth - cellPaddingX * 2 });
    y += rowHeights[i];
  });
  const tableBottom = y;

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

export function buildEarningsReportPdfBuffer({ monthLabel, generatedAt, rows }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    drawLogo(doc);

    const barTop = PAGE_MARGIN + LOGO_SIZE + 20;
    drawHeadingBar(doc, monthLabel, barTop);

    doc.x = PAGE_MARGIN;
    doc.y = barTop + HEADING_BAR_HEIGHT + doc.currentLineHeight() * 1;

    drawEarningsTable(doc, rows);

    doc.moveDown(2);
    doc.font('Helvetica').fontSize(9).fillColor(FOOTER_TEXT_COLOR).text(`Generated on ${generatedAt}`, PAGE_MARGIN, doc.y);

    doc.end();
  });
}
