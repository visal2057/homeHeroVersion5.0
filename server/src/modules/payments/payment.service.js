import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { processCardPayment } from './paymentGateway.service.js';
import {
  getBookingPaymentContext,
  insertBookingPayment,
  insertCommissionRevenue,
} from './payment.queries.js';

// Shared checks: the booking must exist, belong to this client, be Accepted,
// and not already be paid. Used by both the cash and card flows.
function assertPayable(ctx, clientUserId) {
  if (!ctx) throw new AppError('Booking not found', 404);
  if (Number(ctx.client_user_id) !== Number(clientUserId)) {
    throw new AppError('You can only pay for your own bookings', 403);
  }
  if (ctx.booking_status !== 'ACCEPTED') {
    throw new AppError(`This booking cannot be paid for (status: ${ctx.booking_status})`, 409);
  }
  if (ctx.booking_payment_id) {
    throw new AppError('This booking has already been paid', 409);
  }
}

// What the payment page shows before any payment is made.
export async function getPaymentContext(bookingId, clientUserId) {
  const { rows } = await getBookingPaymentContext(bookingId);
  const ctx = rows[0];
  if (!ctx) throw new AppError('Booking not found', 404);
  if (Number(ctx.client_user_id) !== Number(clientUserId)) {
    throw new AppError('You can only pay for your own bookings', 403);
  }

  return {
    bookingId: ctx.booking_id,
    status: ctx.booking_status,
    providerName: ctx.provider_name,
    categoryName: ctx.category_name,
    alreadyPaid: Boolean(ctx.booking_payment_id),
    // Only present if the provider has saved their bank details.
    payee: ctx.bank_name
      ? {
          accountHolderName: ctx.account_holder_name,
          bankName: ctx.bank_name,
          branchName: ctx.branch_name,
          accountLastFour: ctx.account_number_last_four,
        }
      : null,
  };
}

// Cash: the client pays the provider directly. We just record it, with no
// platform fee and no revenue. One simple insert, so no transaction needed.
export async function payWithCash(bookingId, clientUserId) {
  const { rows } = await getBookingPaymentContext(bookingId);
  const ctx = rows[0];
  assertPayable(ctx, clientUserId);

  const { rows: paymentRows } = await insertBookingPayment(pool, {
    bookingId,
    paymentMethod: 'CASH',
    serviceAmount: null,
    paymentStatus: 'EXTERNAL_CONFIRMED',
    gatewayReference: null,
    cardBrand: null,
    cardLastFour: null,
    payee: null,
    clientName: ctx.client_name,
    providerName: ctx.provider_name,
    categoryName: ctx.category_name,
  });

  return { bookingPaymentId: paymentRows[0].booking_payment_id, method: 'CASH', platformFee: 0 };
}

// Card: HomeHero charges the card and keeps the 5% fee. The fee is computed
// by the database, so we read it back and store it as revenue. Payment and
// revenue are written together in one transaction so they can't drift apart.
export async function payWithCard(input, clientUserId) {
  const { bookingId, serviceAmount, cardholderName, cardNumber } = input;

  const { rows } = await getBookingPaymentContext(bookingId);
  const ctx = rows[0];
  assertPayable(ctx, clientUserId);
  if (!ctx.bank_name) {
    throw new AppError('This provider has not set up card payments. Please pay by cash.', 422);
  }

  // Try to charge the card first; if it fails we record nothing.
  const charge = processCardPayment({ cardNumber, cardholderName });
  if (!charge.success) {
    throw new AppError('Your card was declined. Please try another card.', 402);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: paymentRows } = await insertBookingPayment(client, {
      bookingId,
      paymentMethod: 'CARD',
      serviceAmount,
      paymentStatus: 'SUCCESS',
      gatewayReference: charge.reference,
      cardBrand: charge.brand,
      cardLastFour: charge.lastFour,
      payee: {
        lastFour: ctx.account_number_last_four,
        bank: ctx.bank_name,
        branch: ctx.branch_name,
        name: ctx.account_holder_name,
      },
      clientName: ctx.client_name,
      providerName: ctx.provider_name,
      categoryName: ctx.category_name,
    });
    const payment = paymentRows[0];

    // platform_fee is the 5% the database calculated for us.
    if (Number(payment.platform_fee) > 0) {
      await insertCommissionRevenue(client, payment.booking_payment_id, payment.platform_fee);
    }

    await client.query('COMMIT');

    return {
      bookingPaymentId: payment.booking_payment_id,
      method: 'CARD',
      serviceAmount: Number(payment.service_amount),
      platformFee: Number(payment.platform_fee),
      total: Number(payment.total_amount),
      reference: charge.reference,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
