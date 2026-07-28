import path from 'path';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { logAction } from '../audit/audit.service.js';
import { createNotification } from '../notifications/notification.service.js';
import {
  findClientLocation,
  findProviderBookability,
  providerHasCategory,
  isDateUnavailableForProvider,
  findConflictingBooking,
  insertBooking,
  insertBookingLocationSnapshot,
  insertBookingImage,
  findBookingForOwnershipCheck,
  updateBookingStatus,
  updateBookingCancelled,
  updateBookingRejectedWithReason,
  updateBookingRescheduleProposed,
  updateBookingRescheduleAccepted,
  updateBookingRescheduleRejected,
  listClientBookings,
  listProviderBookingsByStatuses,
  getBookingImages,
  getProviderBookingStats,
} from './booking.queries.js';

// Mirrors invoicePdf.js's formatDateRange -- a start-end window rendered as
// literal text at notification-creation time (notifications store a fixed
// message string, not live-computed fields).
function formatDateTimeRange(start, end) {
  const startLabel = new Date(start).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
  const endLabel = new Date(end).toLocaleTimeString('en-LK', { timeStyle: 'short' });
  return `${startLabel} - ${endLabel}`;
}

function toClientBookingShape(row) {
  return {
    id: row.booking_id,
    bookingId: row.booking_id,
    providerName: row.provider_name,
    providerToken: row.provider_token,
    category: row.service_category,
    scheduledAt: row.scheduled_at,
    scheduledEndAt: row.scheduled_end_at,
    status: row.booking_status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
    hasInvoice: row.has_invoice ?? false,
  };
}

export async function createBooking(clientUserId, input, files = []) {
  if (new Date(input.scheduledAt).getTime() <= Date.now()) {
    throw new AppError('The selected date and time must be in the future', 422);
  }
  if (new Date(input.scheduledEndAt).getTime() <= new Date(input.scheduledAt).getTime()) {
    throw new AppError('The end time must be after the start time', 422);
  }

  const { rows: locationRows } = await findClientLocation(clientUserId);
  if (locationRows.length === 0) {
    throw new AppError('Please set your location in your profile before making a booking', 422);
  }

  const { rows: bookabilityRows } = await findProviderBookability(input.providerUserId);
  if (bookabilityRows.length === 0 || !bookabilityRows[0].is_bookable) {
    const reason = bookabilityRows[0]?.bookability_reason ?? 'Provider unavailable';
    throw new AppError(`This Service Provider cannot be booked right now: ${reason}`, 422);
  }

  const { rows: categoryRows } = await providerHasCategory(input.providerUserId, input.serviceCategoryId);
  if (categoryRows.length === 0) {
    throw new AppError('This Service Provider does not offer the selected service category', 422);
  }

  const bookingDateKey = new Date(input.scheduledAt).toISOString().slice(0, 10);
  const { rows: unavailableRows } = await isDateUnavailableForProvider(input.providerUserId, bookingDateKey);
  if (unavailableRows.length > 0) {
    throw new AppError('This Service Provider is unavailable on the selected date', 422);
  }

  const { rows: conflictRows } = await findConflictingBooking(input.providerUserId, input.scheduledAt);
  if (conflictRows.length > 0) {
    throw new AppError('This time slot was just booked, please choose another time', 409);
  }

  const profileLocation = locationRows[0];
  const hasCustomLocation = input.locationLatitude != null && input.locationLongitude != null;
  const location = hasCustomLocation
    ? {
        address_text: input.locationAddress?.trim()
          || `${input.locationLatitude}, ${input.locationLongitude}`,
        latitude: input.locationLatitude,
        longitude: input.locationLongitude,
      }
    : profileLocation;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: bookingRows } = await insertBooking(client, {
      clientUserId,
      providerUserId: input.providerUserId,
      serviceCategoryId: input.serviceCategoryId,
      jobDescription: input.jobDescription,
      scheduledAt: input.scheduledAt,
      scheduledEndAt: input.scheduledEndAt,
    });
    const booking = bookingRows[0];

    await insertBookingLocationSnapshot(client, booking.booking_id, {
      addressText: location.address_text,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    let displayOrder = 1;
    for (const file of files) {
      await insertBookingImage(client, booking.booking_id, {
        storagePath: `/public/booking-images/${path.basename(file.path)}`,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        displayOrder,
      });
      displayOrder += 1;
    }

    await client.query('COMMIT');

    await logAction({
      actorUserId: clientUserId,
      actionCode: 'BOOKING_CREATED',
      entityType: 'booking',
      entityId: booking.booking_id,
      description: `A new booking request (#${booking.booking_id}) was submitted`,
    });

    return { bookingId: booking.booking_id, status: booking.booking_status };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getClientBookings(clientUserId) {
  const { rows } = await listClientBookings(clientUserId);
  return rows.map(toClientBookingShape);
}

export async function cancelBooking(bookingId, clientUserId, reason) {
  const { rows } = await findBookingForOwnershipCheck(bookingId);
  if (rows.length === 0) {
    throw new AppError('Booking not found', 404);
  }
  const booking = rows[0];
  if (Number(booking.client_user_id) !== Number(clientUserId)) {
    throw new AppError('You do not have permission to cancel this booking', 403);
  }
  if (!['PENDING', 'ACCEPTED'].includes(booking.booking_status)) {
    throw new AppError(`A booking with status ${booking.booking_status} cannot be cancelled`, 409);
  }

  const { rows: updatedRows } = await updateBookingCancelled(bookingId, clientUserId, reason ?? null);
  return { bookingId: updatedRows[0].booking_id, status: updatedRows[0].booking_status };
}

function toProviderRowShape(row) {
  return {
    id: row.booking_id,
    client_name: row.client_name,
    client_phone: row.client_phone,
    client_email: row.client_email,
    client_token: row.client_token,
    service_title: row.service_category,
    description: row.job_description,
    created_at: row.requested_at,
    service_date: row.scheduled_at,
    service_end_time: row.scheduled_end_at,
    proposed_service_date: row.proposed_scheduled_at,
    proposed_service_end_time: row.proposed_scheduled_end_at,
    completed_at: row.completed_at,
    location:
      row.address_snapshot != null || row.latitude_snapshot != null
        ? {
            addressText: row.address_snapshot,
            latitude: row.latitude_snapshot != null ? Number(row.latitude_snapshot) : null,
            longitude: row.longitude_snapshot != null ? Number(row.longitude_snapshot) : null,
          }
        : null,
    status: row.booking_status.toLowerCase(),
    rating: row.rating,
    review_text: row.review_text,
    payment_method: row.payment_method,
    has_invoice: row.has_invoice,
  };
}

async function attachImages(rows) {
  return Promise.all(
    rows.map(async (row) => {
      const { rows: imageRows } = await getBookingImages(row.id);
      return { ...row, images: imageRows.map((i) => i.storage_path) };
    }),
  );
}

export async function getProviderRequests(providerUserId, limit = 100) {
  const { rows } = await listProviderBookingsByStatuses(
    providerUserId,
    ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'RESCHEDULE_PENDING', 'RESCHEDULE_REJECTED'],
    limit,
  );
  return attachImages(rows.map(toProviderRowShape));
}

export async function getProviderJobs(providerUserId, limit = 100) {
  const { rows } = await listProviderBookingsByStatuses(providerUserId, ['ACCEPTED'], limit);
  return attachImages(rows.map(toProviderRowShape));
}

export async function getProviderCompletedJobs(providerUserId, limit = 100) {
  const { rows } = await listProviderBookingsByStatuses(providerUserId, ['COMPLETED'], limit);
  return rows.map(toProviderRowShape);
}

async function assertOwnedPendingBooking(bookingId, providerUserId) {
  const { rows } = await findBookingForOwnershipCheck(bookingId);
  if (rows.length === 0) {
    throw new AppError('Booking not found', 404);
  }
  const booking = rows[0];
  if (Number(booking.provider_user_id) !== Number(providerUserId)) {
    throw new AppError('You do not have permission to act on this booking', 403);
  }
  if (booking.booking_status !== 'PENDING') {
    throw new AppError(`This request is no longer pending (current status: ${booking.booking_status})`, 409);
  }
  return booking;
}

export async function acceptBooking(bookingId, providerUserId) {
  const booking = await assertOwnedPendingBooking(bookingId, providerUserId);

  // Multiple clients can hold PENDING requests for the same slot now, so
  // accepting one of several competing requests for the same exact time is
  // an expected case, not just a rare race -- give it a friendly message
  // pointing the provider at reject/reschedule instead of a raw 409/500.
  const { rows: conflictRows } = await findConflictingBooking(providerUserId, booking.scheduled_at);
  if (conflictRows.length > 0) {
    throw new AppError('You already have an accepted booking at that time. Please reject or reschedule this request instead.', 409);
  }

  let rows;
  try {
    ({ rows } = await updateBookingStatus(bookingId, 'ACCEPTED', 'accepted_at'));
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('You already have an accepted booking at that time. Please reject or reschedule this request instead.', 409);
    }
    throw err;
  }

  await logAction({
    actorUserId: providerUserId,
    actionCode: 'BOOKING_ACCEPTED',
    entityType: 'booking',
    entityId: rows[0].booking_id,
    description: `Booking #${rows[0].booking_id} was accepted by the Service Provider`,
  });

  return { bookingId: rows[0].booking_id, status: rows[0].booking_status.toLowerCase() };
}

export async function rejectBooking(bookingId, providerUserId, reason) {
  await assertOwnedPendingBooking(bookingId, providerUserId);
  const { rows } = await updateBookingRejectedWithReason(bookingId, reason);
  const updated = rows[0];

  await logAction({
    actorUserId: providerUserId,
    actionCode: 'BOOKING_REJECTED',
    entityType: 'booking',
    entityId: updated.booking_id,
    description: `Booking #${updated.booking_id} was rejected by the Service Provider`,
  });

  try {
    await createNotification({
      recipientUserId: updated.client_user_id,
      title: 'Booking Rejected',
      message: `The service provider ${updated.provider_full_name} has rejected the request on booking number #${updated.booking_id} due to the reason: ${reason}`,
      relatedType: 'BOOKING',
      relatedId: updated.booking_id,
    });
  } catch (notifyErr) {
    console.error('Failed to send booking-rejected notification:', notifyErr);
  }

  return { bookingId: updated.booking_id, status: updated.booking_status.toLowerCase() };
}

async function assertOwnedReschedulePendingBooking(bookingId, clientUserId) {
  const { rows } = await findBookingForOwnershipCheck(bookingId);
  if (rows.length === 0) {
    throw new AppError('Booking not found', 404);
  }
  const booking = rows[0];
  if (Number(booking.client_user_id) !== Number(clientUserId)) {
    throw new AppError('You do not have permission to act on this booking', 403);
  }
  if (booking.booking_status !== 'RESCHEDULE_PENDING') {
    throw new AppError(`This booking has no pending reschedule proposal (current status: ${booking.booking_status})`, 409);
  }
  return booking;
}

export async function proposeReschedule(bookingId, providerUserId, input) {
  const booking = await assertOwnedPendingBooking(bookingId, providerUserId);

  if (new Date(input.scheduledAt).getTime() <= Date.now()) {
    throw new AppError('The selected date and time must be in the future', 422);
  }
  if (new Date(input.scheduledEndAt).getTime() <= new Date(input.scheduledAt).getTime()) {
    throw new AppError('The end time must be after the start time', 422);
  }

  const bookingDateKey = new Date(input.scheduledAt).toISOString().slice(0, 10);
  const { rows: unavailableRows } = await isDateUnavailableForProvider(providerUserId, bookingDateKey);
  if (unavailableRows.length > 0) {
    throw new AppError('You have marked this date as unavailable', 422);
  }

  const { rows: conflictRows } = await findConflictingBooking(providerUserId, input.scheduledAt);
  if (conflictRows.length > 0) {
    throw new AppError('You already have a booking at that time, please choose another', 409);
  }

  const { rows } = await updateBookingRescheduleProposed(bookingId, input.scheduledAt, input.scheduledEndAt);
  const updated = rows[0];

  await logAction({
    actorUserId: providerUserId,
    actionCode: 'BOOKING_RESCHEDULE_PROPOSED',
    entityType: 'booking',
    entityId: updated.booking_id,
    description: `A reschedule was proposed for booking #${updated.booking_id}`,
  });

  try {
    await createNotification({
      recipientUserId: booking.client_user_id,
      title: 'Reschedule Requested',
      message: `The provider you selected for the booking #${updated.booking_id} has requested a rescheduling to the below date and time: ${formatDateTimeRange(input.scheduledAt, input.scheduledEndAt)}`,
      relatedType: 'BOOKING_RESCHEDULE_PROPOSED',
      relatedId: updated.booking_id,
    });
  } catch (notifyErr) {
    console.error('Failed to send reschedule-proposed notification:', notifyErr);
  }

  return { bookingId: updated.booking_id, status: updated.booking_status.toLowerCase() };
}

export async function acceptReschedule(bookingId, clientUserId) {
  const booking = await assertOwnedReschedulePendingBooking(bookingId, clientUserId);

  const { rows: conflictRows } = await findConflictingBooking(booking.provider_user_id, booking.proposed_scheduled_at);
  if (conflictRows.length > 0) {
    throw new AppError('This time slot was just booked, please choose another time', 409);
  }

  // The findConflictingBooking check above only narrows the race window --
  // it doesn't close it, since it isn't run in the same transaction as this
  // UPDATE. If two clients accept overlapping-proposal reschedules onto the
  // same slot at nearly the same instant, both pre-checks can pass before
  // either UPDATE commits; the DB's uix_provider_accepted_time unique index
  // is the real backstop, so the loser's UPDATE fails with 23505 here
  // instead of silently double-booking the provider (same pattern already
  // used in invoice.service.js for concurrent invoice generation).
  let rows;
  try {
    ({ rows } = await updateBookingRescheduleAccepted(bookingId));
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('This time slot was just booked, please choose another time', 409);
    }
    throw err;
  }
  if (rows.length === 0) {
    throw new AppError('This reschedule proposal is no longer pending', 409);
  }
  const updated = rows[0];

  await logAction({
    actorUserId: clientUserId,
    actionCode: 'BOOKING_RESCHEDULE_ACCEPTED',
    entityType: 'booking',
    entityId: updated.booking_id,
    description: `The Client accepted the proposed reschedule for booking #${updated.booking_id}`,
  });

  try {
    await createNotification({
      recipientUserId: updated.provider_user_id,
      title: 'Reschedule Accepted',
      message: `The client for booking #${updated.booking_id} has accepted the rescheduling.`,
      relatedType: 'BOOKING',
      relatedId: updated.booking_id,
    });
  } catch (notifyErr) {
    console.error('Failed to send reschedule-accepted notification:', notifyErr);
  }

  return { bookingId: updated.booking_id, status: updated.booking_status.toLowerCase() };
}

export async function rejectReschedule(bookingId, clientUserId) {
  await assertOwnedReschedulePendingBooking(bookingId, clientUserId);
  const { rows } = await updateBookingRescheduleRejected(bookingId);
  if (rows.length === 0) {
    throw new AppError('This reschedule proposal is no longer pending', 409);
  }
  const updated = rows[0];

  await logAction({
    actorUserId: clientUserId,
    actionCode: 'BOOKING_RESCHEDULE_REJECTED',
    entityType: 'booking',
    entityId: updated.booking_id,
    description: `The Client rejected the proposed reschedule for booking #${updated.booking_id}`,
  });

  return { bookingId: updated.booking_id, status: updated.booking_status.toLowerCase() };
}

export async function getProviderStats(providerUserId) {
  const { rows } = await getProviderBookingStats(providerUserId);
  const row = rows[0];
  return {
    pending_requests: Number(row.pending_requests),
    accepted_bookings: Number(row.accepted_bookings),
    rejected_bookings: Number(row.rejected_bookings),
    completed_jobs: Number(row.completed_jobs),
    total_jobs: Number(row.total_jobs),
    average_rating: row.average_rating != null ? Number(row.average_rating) : null,
  };
}
