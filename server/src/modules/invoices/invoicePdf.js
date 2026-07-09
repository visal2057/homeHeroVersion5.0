import fs from 'fs';
import PDFDocument from 'pdfkit';

const BRAND_COLOR = '#0f766e';
const TEXT_COLOR = '#1f2937';
const MUTED_COLOR = '#6b7280';

function row(doc, label, value) {
  doc
    .fontSize(10)
    .fillColor(MUTED_COLOR)
    .text(label, { continued: true })
    .fillColor(TEXT_COLOR)
    .text(`  ${value ?? '-'}`);
  doc.moveDown(0.4);
}

export function writeInvoicePdf(destinationPath, invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(destinationPath);

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.pipe(stream);

    doc.fontSize(22).fillColor(BRAND_COLOR).text('HomeHero', { continued: false });
    doc.fontSize(12).fillColor(TEXT_COLOR).text('Service Invoice');
    doc.moveDown(1.5);

    row(doc, 'Booking ID:', invoice.bookingId);
    row(doc, 'Service category:', invoice.serviceCategory);
    row(doc, 'Client:', invoice.clientName);
    row(doc, 'Job location:', invoice.jobLocation);
    row(doc, 'Booking date:', invoice.scheduledAt);
    row(doc, 'Completion date:', invoice.completedAt);
    row(doc, 'Payment method:', invoice.paymentMethod);

    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(MUTED_COLOR).text('Job description:');
    doc.fontSize(10).fillColor(TEXT_COLOR).text(invoice.jobDescription ?? '-');
    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor(BRAND_COLOR)
      .text(`Amount: LKR ${Number(invoice.amount).toFixed(2)}`);
    doc.moveDown(2);

    doc
      .fontSize(10)
      .fillColor(TEXT_COLOR)
      .text('Thank you for choosing HomeHero. We appreciate your hard work.');
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(TEXT_COLOR).text(invoice.providerName);

    doc.end();
  });
}
