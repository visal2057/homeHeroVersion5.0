import path from 'path';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { logAction } from '../audit/audit.service.js';
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
  listClientBookings,
  listProviderBookingsByStatuses,
  getBookingImages,
  getProviderBookingStats,
} from './booking.queries.js';

function toClientBookingShape(row) {
  return {
    id: row.booking_id,
    bookingId: row.booking_id,
    providerName: row.provider_name,
    providerToken: row.provider_token,
    category: row.service_category,
    scheduledAt: row.scheduled_at,
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
    completed_at: row.completed_at,
    location:
      row.address_snapshot
      ?? (row.latitude_snapshot != null ? `${row.latitude_snapshot},${row.longitude_snapshot}` : null),
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
    ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
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
  await assertOwnedPendingBooking(bookingId, providerUserId);
  const { rows } = await updateBookingStatus(bookingId, 'ACCEPTED', 'accepted_at');

  await logAction({
    actorUserId: providerUserId,
    actionCode: 'BOOKING_ACCEPTED',
    entityType: 'booking',
    entityId: rows[0].booking_id,
    description: `Booking #${rows[0].booking_id} was accepted by the Service Provider`,
  });

  return { bookingId: rows[0].booking_id, status: rows[0].booking_status.toLowerCase() };
}

export async function rejectBooking(bookingId, providerUserId) {
  await assertOwnedPendingBooking(bookingId, providerUserId);
  const { rows } = await updateBookingStatus(bookingId, 'REJECTED', 'rejected_at');
  return { bookingId: rows[0].booking_id, status: rows[0].booking_status.toLowerCase() };
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
