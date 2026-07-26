import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../../config/environment.js';
import { AppError } from '../../utils/AppError.js';
import { logAction } from '../audit/audit.service.js';
import { getCardPaymentAmount } from '../payments/payment.service.js';
import { findBookingDetailForInvoice, findInvoiceByBookingId, insertInvoice } from './invoice.queries.js';
import { writeInvoicePdf } from './invoicePdf.js';

const INVOICE_STORAGE_DIR = path.resolve(env.privateStoragePath, 'invoices');
const CLOSING_LINE = 'Thank you for choosing HomeHero. We appreciate your hard work.';

async function loadCompletedBookingForProvider(bookingId, providerUserId) {
  const { rows } = await findBookingDetailForInvoice(bookingId);
  if (rows.length === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = rows[0];
  if (Number(booking.provider_user_id) !== Number(providerUserId)) {
    throw new AppError('You do not have permission to invoice this booking', 403);
  }
  if (booking.booking_status !== 'COMPLETED') {
    throw new AppError('An invoice can only be generated for a completed job', 422);
  }

  return booking;
}

async function resolveLockedCardAmount(booking, providerUserId) {
  const { amount } = await getCardPaymentAmount(booking.booking_id, providerUserId);
  return amount;
}

function toFormResponse(booking, existingInvoice, lockedAmount) {
  const isCard = booking.payment_method === 'CARD';

  return {
    bookingId: booking.booking_id,
    jobDescription: booking.job_description,
    serviceCategory: booking.service_category,
    clientName: booking.client_name,
    jobLocation: booking.job_location,
    scheduledAt: booking.scheduled_at,
    scheduledEndAt: booking.scheduled_end_at,
    completedAt: booking.completed_at,
    paymentMethod: booking.payment_method,
    providerName: booking.provider_name,
    amount: isCard ? lockedAmount : (existingInvoice ? Number(existingInvoice.amount) : null),
    amountEditable: !isCard,
    closingLine: CLOSING_LINE,
    invoiceExists: Boolean(existingInvoice),
  };
}

export async function getInvoiceFormData(bookingId, providerUserId) {
  const booking = await loadCompletedBookingForProvider(bookingId, providerUserId);
  const { rows: invoiceRows } = await findInvoiceByBookingId(bookingId);
  const existingInvoice = invoiceRows[0];

  const lockedAmount =
    booking.payment_method === 'CARD' ? await resolveLockedCardAmount(booking, providerUserId) : null;

  return toFormResponse(booking, existingInvoice, lockedAmount);
}

export async function generateInvoice(bookingId, providerUserId, input) {
  const booking = await loadCompletedBookingForProvider(bookingId, providerUserId);

  const { rows: existingInvoiceRows } = await findInvoiceByBookingId(bookingId);
  if (existingInvoiceRows.length > 0) {
    throw new AppError('An invoice has already been generated for this job', 409);
  }

  const isCard = booking.payment_method === 'CARD';
  let amount;

  if (isCard) {
    amount = await resolveLockedCardAmount(booking, providerUserId);
  } else {
    if (input.amount == null) {
      throw new AppError('Amount is required for a Cash-paid job', 422);
    }
    amount = input.amount;
  }

  fs.mkdirSync(INVOICE_STORAGE_DIR, { recursive: true });
  const fileName = `${crypto.randomUUID()}.pdf`;
  const absolutePath = path.join(INVOICE_STORAGE_DIR, fileName);

  await writeInvoicePdf(absolutePath, {
    bookingId: booking.booking_id,
    jobDescription: booking.job_description,
    serviceCategory: booking.service_category,
    clientName: booking.client_name,
    jobLocation: booking.job_location,
    scheduledAt: booking.scheduled_at,
    scheduledEndAt: booking.scheduled_end_at,
    completedAt: booking.completed_at,
    paymentMethod: booking.payment_method,
    providerName: booking.provider_name,
    amount,
  });

  let invoice;
  try {
    const { rows } = await insertInvoice({
      bookingId: booking.booking_id,
      providerUserId,
      paymentMethod: booking.payment_method,
      amount,
      storagePath: absolutePath,
    });
    invoice = rows[0];
  } catch (err) {
    fs.rmSync(absolutePath, { force: true });
    if (err.code === '23505') {
      throw new AppError('An invoice has already been generated for this job', 409);
    }
    throw err;
  }

  await logAction({
    actorUserId: providerUserId,
    actionCode: 'INVOICE_GENERATED',
    entityType: 'invoice',
    entityId: invoice.invoice_id,
    description: `Invoice generated for booking #${bookingId}`,
  });

  return {
    invoiceId: invoice.invoice_id,
    bookingId: invoice.booking_id,
    amount: Number(invoice.amount),
    paymentMethod: invoice.payment_method,
    generatedAt: invoice.generated_at,
  };
}

export async function getInvoiceDownload(bookingId, requestingUser) {
  const { rows } = await findInvoiceByBookingId(bookingId);
  if (rows.length === 0) {
    throw new AppError('No invoice has been generated for this job yet', 404);
  }

  const invoice = rows[0];
  const isOwningProvider =
    requestingUser.role === 'SERVICE_PROVIDER' && Number(requestingUser.userId) === Number(invoice.provider_user_id);
  const isOwningClient =
    requestingUser.role === 'CLIENT' && Number(requestingUser.userId) === Number(invoice.client_user_id);
  const isSystemAdmin = requestingUser.role === 'SYSTEM_ADMIN';

  if (!isOwningProvider && !isOwningClient && !isSystemAdmin) {
    throw new AppError('You do not have permission to access this invoice', 403);
  }

  if (!fs.existsSync(invoice.storage_path)) {
    throw new AppError('The invoice file could not be found', 404);
  }

  return { storagePath: invoice.storage_path, fileName: `invoice-${invoice.booking_id}.pdf` };
}
