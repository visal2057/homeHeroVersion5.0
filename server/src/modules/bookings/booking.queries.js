import { query } from '../../db/query.js';

export function findClientLocation(clientUserId) {
  return query(
    `SELECT latitude, longitude, address_text FROM client_locations WHERE client_user_id = $1`,
    [clientUserId],
  );
}

export function findProviderBookability(providerUserId) {
  return query(`SELECT * FROM vw_provider_bookability WHERE provider_user_id = $1`, [providerUserId]);
}

export function providerHasCategory(providerUserId, serviceCategoryId) {
  return query(
    `SELECT 1 FROM provider_service_categories WHERE provider_user_id = $1 AND service_category_id = $2`,
    [providerUserId, serviceCategoryId],
  );
}

export function isDateUnavailableForProvider(providerUserId, date) {
  return query(
    `SELECT 1 FROM provider_unavailable_periods
     WHERE provider_user_id = $1 AND $2::date BETWEEN unavailable_from AND unavailable_to`,
    [providerUserId, date],
  );
}

export function findConflictingBooking(providerUserId, scheduledAt) {
  return query(
    `SELECT booking_id FROM bookings
     WHERE provider_user_id = $1 AND scheduled_at = $2 AND booking_status IN ('PENDING', 'ACCEPTED')`,
    [providerUserId, scheduledAt],
  );
}

export function insertBooking(client, { clientUserId, providerUserId, serviceCategoryId, jobDescription, scheduledAt }) {
  return client.query(
    `INSERT INTO bookings (client_user_id, provider_user_id, service_category_id, job_description, scheduled_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [clientUserId, providerUserId, serviceCategoryId, jobDescription, scheduledAt],
  );
}

export function insertBookingLocationSnapshot(client, bookingId, { addressText, latitude, longitude }) {
  return client.query(
    `INSERT INTO booking_locations (booking_id, address_snapshot, latitude_snapshot, longitude_snapshot)
     VALUES ($1, $2, $3, $4)`,
    [bookingId, addressText, latitude, longitude],
  );
}

export function insertBookingImage(client, bookingId, { storagePath, originalFilename, mimeType, fileSizeBytes, displayOrder }) {
  return client.query(
    `INSERT INTO booking_images (booking_id, storage_path, original_filename, mime_type, file_size_bytes, display_order)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [bookingId, storagePath, originalFilename, mimeType, fileSizeBytes, displayOrder],
  );
}

export function findBookingForOwnershipCheck(bookingId) {
  return query(
    `SELECT booking_id, client_user_id, provider_user_id, booking_status FROM bookings WHERE booking_id = $1`,
    [bookingId],
  );
}

export function updateBookingStatus(bookingId, newStatus, timestampColumn) {
  return query(
    `UPDATE bookings SET booking_status = $1, ${timestampColumn} = now() WHERE booking_id = $2 RETURNING *`,
    [newStatus, bookingId],
  );
}

export function updateBookingCancelled(bookingId, cancelledByUserId, reason) {
  return query(
    `UPDATE bookings
     SET booking_status = 'CANCELLED', cancelled_at = now(), cancelled_by_user_id = $1, cancellation_reason = $2
     WHERE booking_id = $3
     RETURNING *`,
    [cancelledByUserId, reason, bookingId],
  );
}

export function listClientBookings(clientUserId) {
  return query(`SELECT * FROM vw_booking_overview WHERE client_user_id = $1 ORDER BY requested_at DESC`, [clientUserId]);
}

export function listProviderBookingsByStatuses(providerUserId, statuses, limit) {
  return query(
    `SELECT b.booking_id, b.job_description, b.scheduled_at, b.requested_at, b.completed_at, b.booking_status,
            cu.full_name AS client_name, cu.phone AS client_phone, cu.email AS client_email, cu.user_token AS client_token,
            sc.category_name AS service_category,
            bl.latitude_snapshot, bl.longitude_snapshot,
            r.rating, r.review_text
     FROM bookings b
     JOIN users cu ON cu.user_id = b.client_user_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN booking_locations bl ON bl.booking_id = b.booking_id
     LEFT JOIN reviews r ON r.booking_id = b.booking_id
     WHERE b.provider_user_id = $1 AND b.booking_status = ANY($2::booking_status[])
     ORDER BY b.requested_at DESC
     LIMIT $3`,
    [providerUserId, statuses, limit],
  );
}

export function getBookingImages(bookingId) {
  return query(
    `SELECT storage_path FROM booking_images WHERE booking_id = $1 ORDER BY display_order`,
    [bookingId],
  );
}

export function getProviderBookingStats(providerUserId) {
  return query(
    `SELECT
       b.pending_requests, b.accepted_bookings, b.rejected_bookings, b.completed_jobs, b.total_jobs,
       s.average_rating
     FROM (
       SELECT
         count(*) FILTER (WHERE booking_status = 'PENDING') AS pending_requests,
         count(*) FILTER (WHERE booking_status = 'ACCEPTED') AS accepted_bookings,
         count(*) FILTER (WHERE booking_status = 'REJECTED') AS rejected_bookings,
         count(*) FILTER (WHERE booking_status = 'COMPLETED') AS completed_jobs,
         count(*) AS total_jobs
       FROM bookings
       WHERE provider_user_id = $1
     ) b
     LEFT JOIN vw_provider_statistics s ON s.provider_user_id = $1`,
    [providerUserId],
  );
}

export function adminSearchBookings({ search, status, period, limit = 100 }) {
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    params.push(Number.isFinite(Number(search)) ? Number(search) : -1);
    const idIdx = params.length;
    conditions.push(
      `(client_name ILIKE $${idx} OR provider_name ILIKE $${idx} OR client_token ILIKE $${idx} OR provider_token ILIKE $${idx} OR booking_id = $${idIdx})`,
    );
  }

  if (status) {
    params.push(status);
    conditions.push(`booking_status = $${params.length}`);
  }

  if (period === 'this_month') {
    conditions.push(`date_trunc('month', requested_at) = date_trunc('month', now())`);
  } else if (period === 'last_month') {
    conditions.push(`date_trunc('month', requested_at) = date_trunc('month', now() - interval '1 month')`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit);

  return query(
    `SELECT * FROM vw_booking_overview ${whereClause} ORDER BY requested_at DESC LIMIT $${params.length}`,
    params,
  );
}
