import { query } from '../../db/query.js';
import { AppError } from '../../utils/AppError.js';

export function findCategoryByCode(categoryCode) {
  return query(
    `SELECT service_category_id, category_code, category_name FROM service_categories WHERE category_code = $1`,
    [categoryCode],
  );
}

export function getProviderCoreProfile(userId) {
  return query(
    `SELECT
       u.user_id, u.username, u.email, u.full_name, u.phone, u.user_token,
       u.profile_image_url, u.account_status,
       spp.bio, spp.work_hours_details, spp.hourly_charge_estimate, spp.manual_online,
       spp.verification_status,
       spp.home_district_id, hd.district_name AS home_district_name,
       spp.service_district_id, sd.district_name AS service_district_name
     FROM users u
     JOIN service_provider_profiles spp ON spp.provider_user_id = u.user_id
     JOIN districts hd ON hd.district_id = spp.home_district_id
     JOIN districts sd ON sd.district_id = spp.service_district_id
     WHERE u.user_id = $1`,
    [userId],
  );
}

export function getProviderCategories(userId) {
  return query(
    `SELECT sc.service_category_id, sc.category_code, sc.category_name
     FROM provider_service_categories psc
     JOIN service_categories sc ON sc.service_category_id = psc.service_category_id
     WHERE psc.provider_user_id = $1
     ORDER BY sc.category_name`,
    [userId],
  );
}

export function getProviderMembership(userId) {
  return query(`SELECT * FROM vw_current_provider_membership WHERE provider_user_id = $1`, [userId]);
}

export function getProviderStatistics(userId) {
  return query(`SELECT * FROM vw_provider_statistics WHERE provider_user_id = $1`, [userId]);
}

export function getProviderBookability(userId) {
  return query(`SELECT * FROM vw_provider_bookability WHERE provider_user_id = $1`, [userId]);
}

export function updateProviderBasicInfo(client, userId, { username, fullName, phone }) {
  return client.query(
    `UPDATE users SET username = $1, full_name = $2, phone = $3, updated_at = now() WHERE user_id = $4 RETURNING *`,
    [username, fullName, phone, userId],
  );
}

export function updateProviderDetails(client, userId, { bio, workHoursDetails, hourlyChargeEstimate, homeDistrictId, serviceDistrictId }) {
  return client.query(
    `UPDATE service_provider_profiles
     SET bio = $1, work_hours_details = $2, hourly_charge_estimate = $3,
         home_district_id = $4, service_district_id = $5, updated_at = now()
     WHERE provider_user_id = $6
     RETURNING *`,
    [bio, workHoursDetails, hourlyChargeEstimate, homeDistrictId, serviceDistrictId, userId],
  );
}

export function findProviderCategoryIdsWithBookings(client, userId, categoryIds) {
  return client.query(
    `SELECT DISTINCT service_category_id FROM bookings
     WHERE provider_user_id = $1 AND service_category_id = ANY($2::smallint[])`,
    [userId, categoryIds],
  );
}

// Categories already tied to a booking can't be unassigned (provider_service_categories
// is referenced by bookings via a composite FK), so this only removes/adds the difference
// instead of deleting and reinserting everything.
export async function replaceProviderCategories(client, userId, categoryIds) {
  const { rows: currentRows } = await client.query(
    `SELECT service_category_id FROM provider_service_categories WHERE provider_user_id = $1`,
    [userId],
  );
  const currentIds = currentRows.map((r) => r.service_category_id);
  const toRemove = currentIds.filter((id) => !categoryIds.includes(id));
  const toAdd = categoryIds.filter((id) => !currentIds.includes(id));

  if (toRemove.length > 0) {
    const { rows: blockedRows } = await findProviderCategoryIdsWithBookings(client, userId, toRemove);
    if (blockedRows.length > 0) {
      throw new AppError(
        'Cannot remove a service category that already has bookings recorded against it',
        409,
      );
    }
    await client.query(
      `DELETE FROM provider_service_categories WHERE provider_user_id = $1 AND service_category_id = ANY($2::smallint[])`,
      [userId, toRemove],
    );
  }

  for (const categoryId of toAdd) {
    await client.query(
      `INSERT INTO provider_service_categories (provider_user_id, service_category_id) VALUES ($1, $2)`,
      [userId, categoryId],
    );
  }
}

export function updateProviderProfileImage(userId, profileImageUrl) {
  return query(
    `UPDATE users SET profile_image_url = $1, updated_at = now() WHERE user_id = $2 RETURNING profile_image_url`,
    [profileImageUrl, userId],
  );
}

// Shared by both search queries below: the single most recent active portfolio
// post for a provider, with its images, so a Client hovering a card in
// Explore can see real previous-work data instead of nothing.
const WORK_PREVIEW_LATERAL_JOIN = `
     LEFT JOIN LATERAL (
       SELECT pp.title, pp.description,
              COALESCE(
                array_agg(ppi.storage_path ORDER BY ppi.display_order) FILTER (WHERE ppi.storage_path IS NOT NULL),
                '{}'
              ) AS images
       FROM portfolio_posts pp
       LEFT JOIN portfolio_post_images ppi ON ppi.portfolio_post_id = pp.portfolio_post_id
       WHERE pp.provider_user_id = vs.provider_user_id AND pp.is_active = true
       GROUP BY pp.portfolio_post_id
       ORDER BY pp.created_at DESC
       LIMIT 1
     ) wp ON true`;

export function findTopProviders(categoryId, { district, search }, limit = 5) {
  return query(
    `SELECT vs.*, bk.is_verified, bk.has_active_ban, up.unavailable_from, up.unavailable_to,
            wp.title AS work_title, wp.description AS work_description, wp.images AS work_images
     FROM vw_provider_search vs
     JOIN vw_provider_bookability bk ON bk.provider_user_id = vs.provider_user_id
     LEFT JOIN LATERAL (
       SELECT unavailable_from, unavailable_to
       FROM provider_unavailable_periods
       WHERE provider_user_id = vs.provider_user_id AND unavailable_to >= CURRENT_DATE
       ORDER BY unavailable_from
       LIMIT 1
     ) up ON true${WORK_PREVIEW_LATERAL_JOIN}
     WHERE vs.service_category_id = $1
       AND bk.is_verified = true
       AND bk.has_active_ban = false
       AND ($2::text IS NULL OR vs.district_name ILIKE $2)
       AND ($3::text IS NULL OR vs.provider_name ILIKE '%' || $3 || '%')
     ORDER BY vs.current_month_completed_jobs DESC, vs.average_rating DESC NULLS LAST
     LIMIT $4`,
    [categoryId, district ?? null, search ?? null, limit],
  );
}

export function findAvailableProviders(categoryId, { district, search }, limit = 20) {
  return query(
    `SELECT vs.*, bk.is_verified, bk.has_active_ban, bk.has_valid_membership_or_grace, up.unavailable_from, up.unavailable_to,
            wp.title AS work_title, wp.description AS work_description, wp.images AS work_images
     FROM vw_provider_search vs
     JOIN vw_provider_bookability bk ON bk.provider_user_id = vs.provider_user_id
     LEFT JOIN LATERAL (
       SELECT unavailable_from, unavailable_to
       FROM provider_unavailable_periods
       WHERE provider_user_id = vs.provider_user_id AND unavailable_to >= CURRENT_DATE
       ORDER BY unavailable_from
       LIMIT 1
     ) up ON true${WORK_PREVIEW_LATERAL_JOIN}
     WHERE vs.service_category_id = $1
       AND bk.is_verified = true
       AND bk.has_active_ban = false
       AND bk.has_valid_membership_or_grace = true
       AND vs.is_newcomer = true
       AND ($2::text IS NULL OR vs.district_name ILIKE $2)
       AND ($3::text IS NULL OR vs.provider_name ILIKE '%' || $3 || '%')
     ORDER BY vs.completed_job_count DESC
     LIMIT $4`,
    [categoryId, district ?? null, search ?? null, limit],
  );
}

export function getPublicProviderCore(providerId) {
  return query(
    `SELECT
       u.user_id, u.full_name, u.user_token, u.profile_image_url,
       spp.bio, spp.hourly_charge_estimate,
       sd.district_name AS service_district_name,
       bk.is_verified, bk.is_bookable, bk.bookability_reason,
       stats.average_rating, stats.review_count
     FROM users u
     JOIN service_provider_profiles spp ON spp.provider_user_id = u.user_id
     JOIN districts sd ON sd.district_id = spp.service_district_id
     JOIN vw_provider_bookability bk ON bk.provider_user_id = u.user_id
     LEFT JOIN vw_provider_statistics stats ON stats.provider_user_id = u.user_id
     WHERE u.user_id = $1`,
    [providerId],
  );
}

export function getProviderUnavailablePeriods(providerId) {
  return query(
    `SELECT unavailable_from, unavailable_to
     FROM provider_unavailable_periods
     WHERE provider_user_id = $1 AND unavailable_to >= CURRENT_DATE
     ORDER BY unavailable_from`,
    [providerId],
  );
}

export function getProviderPortfolioPosts(providerId) {
  return query(
    `SELECT pp.portfolio_post_id, pp.title, pp.description, pp.created_at,
            sc.category_name,
            COALESCE(
              array_agg(ppi.storage_path ORDER BY ppi.display_order) FILTER (WHERE ppi.storage_path IS NOT NULL),
              '{}'
            ) AS image_paths
     FROM portfolio_posts pp
     JOIN bookings b ON b.booking_id = pp.booking_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN portfolio_post_images ppi ON ppi.portfolio_post_id = pp.portfolio_post_id
     WHERE pp.provider_user_id = $1 AND pp.is_active = true
     GROUP BY pp.portfolio_post_id, sc.category_name
     ORDER BY pp.created_at DESC`,
    [providerId],
  );
}

export function getProviderReviews(providerId) {
  return query(
    `SELECT r.review_id, r.rating, r.review_text, r.created_at, u.full_name AS client_name,
            b.booking_id, sc.category_name
     FROM reviews r
     JOIN bookings b ON b.booking_id = r.booking_id
     JOIN users u ON u.user_id = b.client_user_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     WHERE b.provider_user_id = $1
     ORDER BY r.created_at DESC`,
    [providerId],
  );
}
