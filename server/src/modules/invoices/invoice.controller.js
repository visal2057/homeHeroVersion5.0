import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as invoiceService from './invoice.service.js';

// GET /api/invoices/booking/:bookingId
export const getInvoiceStatusHandler = asyncHandler(async (req, res) => {
  const data = await invoiceService.getInvoiceStatus(req.params.bookingId, req.user.userId);
  sendSuccess(res, data);
});

// POST /api/invoices/booking/:bookingId/generate
export const generateInvoiceHandler = asyncHandler(async (req, res) => {
  const data = await invoiceService.generateInvoice(req.params.bookingId, req.user.userId, req.body);
  sendSuccess(res, data, 201);
});

// GET /api/invoices/booking/:bookingId/download
export const downloadInvoiceHandler = asyncHandler(async (req, res) => {
  const storagePath = await invoiceService.downloadInvoice(req.params.bookingId, req.user.userId);
  res.sendFile(storagePath, {
    headers: { 'Content-Type': 'application/pdf' },
  });
});

// GET /api/invoices/mine
export const listMyInvoicesHandler = asyncHandler(async (req, res) => {
  const data = await invoiceService.listMyInvoicedBookingIds(req.user.userId);
  sendSuccess(res, data);
});
