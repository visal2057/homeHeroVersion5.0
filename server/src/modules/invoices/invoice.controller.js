import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as invoiceService from './invoice.service.js';

export const getInvoiceFormHandler = asyncHandler(async (req, res) => {
  const form = await invoiceService.getInvoiceFormData(Number(req.params.bookingId), req.user.userId);
  sendSuccess(res, { form });
});

export const generateInvoiceHandler = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.generateInvoice(Number(req.params.bookingId), req.user.userId, req.body);
  sendSuccess(res, { invoice }, 201);
});

export const downloadInvoiceHandler = asyncHandler(async (req, res) => {
  const { storagePath, fileName } = await invoiceService.getInvoiceDownload(Number(req.params.bookingId), req.user);
  res.sendFile(storagePath, {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` },
  });
});
