import { asyncHandler } from '../../utils/asyncHandler.js';
import { buildEarningsReportPdf } from './report.service.js';
import { logAction } from '../audit/audit.service.js';

export const generateEarningsReportHandler = asyncHandler(async (req, res) => {
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();
  const month = Number(req.query.month) || now.getMonth() + 1;

  const pdfBuffer = await buildEarningsReportPdf({ year, month });

  await logAction({
    actorUserId: req.user.userId,
    actionCode: 'EARNINGS_REPORT_GENERATED',
    entityType: 'report',
    description: `Earnings report generated for ${month}/${year}`,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="homehero-earnings-${year}-${month}.pdf"`);
  res.send(pdfBuffer);
});
