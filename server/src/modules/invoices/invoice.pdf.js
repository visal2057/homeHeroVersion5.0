import PDFDocument from 'pdfkit';

// Same pdfkit + in-memory-Buffer pattern and HomeHero color scheme as
// server/src/modules/reports/earningsReport.service.js.
export async function buildInvoicePdf({
  bookingId, jobDescription, categoryName, clientName, location,
  bookingDate, completionDate, paymentMethod, providerName, amount,
}) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(20).fillColor('#047857').text('HomeHero Invoice', { align: 'left' });
  doc.fontSize(12).fillColor('#334155').text(`Booking #${bookingId}`);
  doc.moveDown(1);
  doc.strokeColor('#a7f3d0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  const rows = [
    ['Booking ID', `#${bookingId}`],
    ['Job description', jobDescription],
    ['Service category', categoryName],
    ['Client name', clientName],
    ['Job location', location ?? '—'],
    ['Booking date', bookingDate ? new Date(bookingDate).toLocaleDateString() : '—'],
    ['Completion date', completionDate ? new Date(completionDate).toLocaleDateString() : '—'],
    ['Payment method', paymentMethod],
    ['Service Provider', providerName],
  ];

  doc.fontSize(12).fillColor('#0f172a');
  rows.forEach(([label, value]) => {
    const y = doc.y;
    doc.text(label, 50, y, { continued: false });
    doc.text(String(value), 250, y, { width: 295 });
    doc.moveDown(0.6);
  });

  doc.moveDown(0.4);
  doc.font('Helvetica-Bold');
  const y = doc.y;
  doc.text('Amount', 50, y);
  doc.text(`LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 250, y);
  doc.font('Helvetica');
  doc.moveDown(2);

  doc.fontSize(11).fillColor('#334155').text('Thank you for using HomeHero.');
  doc.text(providerName);

  doc.moveDown(1.5);
  doc.fontSize(9).fillColor('#64748b').text(`Generated on ${new Date().toLocaleString()}`, { align: 'left' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
