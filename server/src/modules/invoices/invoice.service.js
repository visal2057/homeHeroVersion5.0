import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/environment.js';
import {
  getBookingForInvoice,
  insertInvoice,
  listInvoicedBookingIdsForProvider,
  getInvoiceForDownload,
} from './invoice.queries.js';
import { buildInvoicePdf } from './invoice.pdf.js';

function assertOwnedCompletedBooking(ctx, providerUserId) {
  if (!ctx) throw new AppError('Booking not found', 404);
  if (Number(ctx.provider_user_id) !== Number(providerUserId)) {
    throw new AppError('You can only view your own bookings', 403);
  }
  if (ctx.booking_status !== 'COMPLETED') {
    throw new AppError('An invoice can only be generated for a completed job', 409);
  }
}

// Autofill data + whether an invoice already exists, for the row menu and
// the Create Invoice modal.
export async function getInvoiceStatus(bookingId, providerUserId) {
  const { rows } = await getBookingForInvoice(bookingId);
  const ctx = rows[0];
  assertOwnedCompletedBooking(ctx, providerUserId);

  return {
    bookingId: ctx.booking_id,
    jobDescription: ctx.job_description,
    categoryName: ctx.category_name,
    clientName: ctx.client_name,
    location: ctx.address_snapshot,
    bookingDate: ctx.scheduled_at,
    completionDate: ctx.completed_at,
    providerName: ctx.provider_name,
    paymentMethod: ctx.payment_method,
    // Only present (and locked) for Card jobs -- read from Visal's payment record.
    lockedAmount: ctx.payment_method === 'CARD' ? Number(ctx.service_amount) : null,
    invoiceExists: Boolean(ctx.invoice_id),
  };
}

// A Service Provider may generate only one invoice per completed booking.
export async function generateInvoice(bookingId, providerUserId, { cashAmount } = {}) {
  const { rows } = await getBookingForInvoice(bookingId);
  const ctx = rows[0];
  assertOwnedCompletedBooking(ctx, providerUserId);

  if (ctx.invoice_id) {
    throw new AppError('An invoice has already been generated for this booking', 409);
  }
  if (!ctx.payment_method) {
    throw new AppError('This booking has not been paid for yet', 409);
  }

  let amount;
  if (ctx.payment_method === 'CARD') {
    // Never accept a client-supplied amount for Card jobs -- always the
    // exact figure Visal's payment module recorded.
    amount = Number(ctx.service_amount);
  } else {
    amount = Number(cashAmount);
    if (!amount || amount <= 0) {
      throw new AppError('Enter the amount received for this Cash job', 422);
    }
  }

  const pdfBuffer = await buildInvoicePdf({
    bookingId: ctx.booking_id,
    jobDescription: ctx.job_description,
    categoryName: ctx.category_name,
    clientName: ctx.client_name,
    location: ctx.address_snapshot,
    bookingDate: ctx.scheduled_at,
    completionDate: ctx.completed_at,
    paymentMethod: ctx.payment_method,
    providerName: ctx.provider_name,
    amount,
  });

  const invoicesDir = path.resolve(env.privateStoragePath, 'invoices');
  fs.mkdirSync(invoicesDir, { recursive: true });
  const storagePath = path.join(invoicesDir, `${crypto.randomUUID()}.pdf`);
  fs.writeFileSync(storagePath, pdfBuffer);

  const { rows: invoiceRows } = await insertInvoice({
    bookingId: ctx.booking_id,
    providerUserId,
    paymentMethod: ctx.payment_method,
    amount,
    storagePath,
  });

  return { invoiceId: invoiceRows[0].invoice_id };
}

export async function downloadInvoice(bookingId, providerUserId) {
  const { rows } = await getInvoiceForDownload(bookingId);
  const invoice = rows[0];
  if (!invoice) throw new AppError('No invoice has been generated for this booking', 404);
  if (Number(invoice.provider_user_id) !== Number(providerUserId)) {
    throw new AppError('You can only download your own invoices', 403);
  }
  if (!fs.existsSync(invoice.storage_path)) {
    throw new AppError('Invoice file is missing', 404);
  }

  return invoice.storage_path;
}

export async function listMyInvoicedBookingIds(providerUserId) {
  const { rows } = await listInvoicedBookingIdsForProvider(providerUserId);
  return rows.map((r) => r.booking_id);
}
