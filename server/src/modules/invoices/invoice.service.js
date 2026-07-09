import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../../config/environment.js';
import { AppError } from '../../utils/AppError.js';
import {
  findCompletedBookingForInvoice,
  findInvoiceByBookingId,
  insertInvoice,
} from './invoice.queries.js';
import { writeInvoicePdf } from './invoicePdf.js';

const INVOICE_STORAGE_DIR = path.resolve(env.privateStoragePath, 'invoices');
const CLOSING_LINE = 'Thank you for choosing HomeHero. We appreciate your hard work.';

async function loadBookingForProvider(bookingId, providerId) {
  const { rows } = await findCompletedBookingForInvoice(bookingId, providerId);
  if (rows.length === 0) {
    throw new AppError('Booking not found for this Service Provider', 404);
  }

  const booking = rows[0];
  if (booking.status !== 'COMPLETED') {
    throw new AppError('An invoice can only be generated for a completed job', 422);
  }

  return booking;
}

function toInvoiceFormResponse(booking, existingInvoice) {
  const isCard = booking.payment_method === 'CARD';

  return {
    bookingId: booking.booking_id,
    jobDescription: booking.job_description,
    serviceCategoryName: booking.service_category_name,
    clientName: booking.client_name,
    jobLocation: booking.job_location,
    bookingDate: booking.booking_date,
    completionDate: booking.completion_date,
    paymentMethod: booking.payment_method,
    providerName: booking.provider_name,
    amount: isCard ? booking.card_service_amount : null,
    amountEditable: !isCard,
    closingLine: CLOSING_LINE,
    invoiceExists: Boolean(existingInvoice),
  };
}

export async function getInvoiceFormData(bookingId, providerId) {
  const booking = await loadBookingForProvider(bookingId, providerId);
  const { rows: invoiceRows } = await findInvoiceByBookingId(bookingId);
  return toInvoiceFormResponse(booking, invoiceRows[0]);
}

export async function generateInvoice(bookingId, providerId, input) {
  const booking = await loadBookingForProvider(bookingId, providerId);

  const { rows: existingInvoiceRows } = await findInvoiceByBookingId(bookingId);
  if (existingInvoiceRows.length > 0) {
    throw new AppError('An invoice has already been generated for this job', 409);
  }

  const isCard = booking.payment_method === 'CARD';
  let amount;

  if (isCard) {
    if (booking.card_service_amount == null) {
      throw new AppError('No recorded payment amount was found for this Card-paid job', 422);
    }
    amount = Number(booking.card_service_amount);
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
    serviceCategoryName: booking.service_category_name,
    clientName: booking.client_name,
    jobLocation: booking.job_location,
    bookingDate: booking.booking_date,
    completionDate: booking.completion_date,
    paymentMethod: booking.payment_method,
    providerName: booking.provider_name,
    amount,
  });

  const relativePath = path.relative(process.cwd(), absolutePath);

  try {
    const { rows } = await insertInvoice({
      bookingId: booking.booking_id,
      providerId,
      paymentMethod: booking.payment_method,
      amount,
      pdfStoragePath: relativePath,
    });
    return rows[0];
  } catch (err) {
    fs.rmSync(absolutePath, { force: true });
    if (err.code === '23505') {
      throw new AppError('An invoice has already been generated for this job', 409);
    }
    throw err;
  }
}

export async function getInvoiceDownload(bookingId, requestingUser) {
  const { rows } = await findInvoiceByBookingId(bookingId);
  if (rows.length === 0) {
    throw new AppError('No invoice has been generated for this job yet', 404);
  }

  const invoice = rows[0];
  const isOwningProvider = requestingUser.role === 'SERVICE_PROVIDER' && requestingUser.userId === invoice.provider_id;
  const isSystemAdmin = requestingUser.role === 'SYSTEM_ADMIN';

  if (!isOwningProvider && !isSystemAdmin) {
    throw new AppError('You do not have permission to access this invoice', 403);
  }

  const absolutePath = path.resolve(process.cwd(), invoice.pdf_storage_path);
  if (!fs.existsSync(absolutePath)) {
    throw new AppError('The invoice file could not be found', 404);
  }

  return { absolutePath, fileName: `invoice-${invoice.booking_id}.pdf` };
}
