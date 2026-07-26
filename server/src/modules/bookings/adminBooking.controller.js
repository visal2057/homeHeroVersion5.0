import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { adminSearchBookings } from './booking.queries.js';

export const listBookingsHandler = asyncHandler(async (req, res) => {
  const { search, status, period } = req.query;
  const { rows } = await adminSearchBookings({ search, status, period });

  const bookings = rows.map((row) => ({
    bookingId: row.booking_id,
    clientName: row.client_name,
    clientToken: row.client_token,
    providerName: row.provider_name,
    providerToken: row.provider_token,
    serviceCategory: row.service_category,
    scheduledAt: row.scheduled_at,
    scheduledEndAt: row.scheduled_end_at,
    bookingStatus: row.booking_status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
    hasInvoice: row.invoice_id !== null,
  }));

  sendSuccess(res, { bookings });
});
