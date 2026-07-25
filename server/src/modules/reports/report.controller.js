import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { buildEarningsReportPdf, buildSpReportPdf } from './report.service.js';
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

export const generateSpReportHandler = asyncHandler(async (req, res) => {
  const search = (req.query.search ?? '').trim();
  if (!search) {
    throw new AppError('A search term is required', 422);
  }

  const { buffer, userToken } = await buildSpReportPdf(search);

  await logAction({
    actorUserId: req.user.userId,
    actionCode: 'SP_REPORT_GENERATED',
    entityType: 'report',
    description: `Service Provider report generated for search "${search}"`,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="homehero-sp-report-${userToken}.pdf"`);
  res.send(buffer);
});
