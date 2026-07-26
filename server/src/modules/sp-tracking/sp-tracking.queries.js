import { query } from '../../db/query.js';

// Matches a Service Provider by exact 6-character token or partial name,
// scoped to the SERVICE_PROVIDER role. An exact token match is ranked first
// so a token search never gets shadowed by an unrelated name substring hit.
export function findProviderBySearch(search) {
  return query(
    `SELECT u.user_id, u.full_name, u.user_token, u.profile_image_url
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     JOIN service_provider_profiles spp ON spp.provider_user_id = u.user_id
     WHERE r.role_code = 'SERVICE_PROVIDER'
       AND (u.user_token = $1 OR u.full_name ILIKE '%' || $1 || '%')
     ORDER BY (u.user_token = $1) DESC, u.full_name
     LIMIT 1`,
    [search],
  );
}

// One round trip: every completed job for this provider, with client info,
// the recorded Card-payment amount, and whether an invoice exists -- mirrors
// the LEFT JOIN invoices shape used by invoice.queries.js.
export function findCompletedJobsForProvider(providerUserId) {
  return query(
    `SELECT b.booking_id, b.job_description, b.scheduled_at, b.scheduled_end_at, b.completed_at,
            cu.full_name AS client_name, cu.user_token AS client_token,
            sc.category_name AS service_category,
            bl.address_snapshot AS job_location,
            bp.payment_method, bp.service_amount,
            i.invoice_id, i.amount AS invoice_amount
     FROM bookings b
     JOIN users cu ON cu.user_id = b.client_user_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN booking_locations bl ON bl.booking_id = b.booking_id
     LEFT JOIN booking_payments bp ON bp.booking_id = b.booking_id
     LEFT JOIN invoices i ON i.booking_id = b.booking_id
     WHERE b.provider_user_id = $1 AND b.booking_status = 'COMPLETED'
     ORDER BY b.completed_at DESC`,
    [providerUserId],
  );
}

// Aggregate stat card figures for one provider: lifetime booking funnel
// counts, review average, HomeHero-verified Card earnings, and how many
// memberships they've ever purchased. accepted_at/rejected_at are checked
// rather than the current booking_status so a since-completed job still
// counts toward "accepted" (it passed through that stage on its way here).
// Each subquery returns exactly one row, so the cross join is safe.
export function findProviderStats(providerUserId) {
  return query(
    `SELECT
       b.received, b.accepted, b.rejected, b.completed,
       rv.average_rating, rv.review_count,
       e.total_earnings,
       m.memberships_bought
     FROM
       (SELECT COUNT(*) AS received,
               COUNT(*) FILTER (WHERE accepted_at IS NOT NULL) AS accepted,
               COUNT(*) FILTER (WHERE rejected_at IS NOT NULL) AS rejected,
               COUNT(*) FILTER (WHERE booking_status = 'COMPLETED') AS completed
        FROM bookings WHERE provider_user_id = $1) b,
       (SELECT ROUND(AVG(r.rating), 2) AS average_rating, COUNT(*) AS review_count
        FROM reviews r
        JOIN bookings bk ON bk.booking_id = r.booking_id
        WHERE bk.provider_user_id = $1) rv,
       (SELECT COALESCE(SUM(amount), 0) AS total_earnings
        FROM provider_earnings WHERE provider_user_id = $1) e,
       (SELECT COUNT(*) AS memberships_bought
        FROM provider_memberships WHERE provider_user_id = $1) m`,
    [providerUserId],
  );
}

// Top providers across all five categories combined, ranked by lifetime
// completed-job count (rating as tie-breaker). A provider with two
// categories is joined against provider_service_categories twice, so
// booking counts use COUNT(DISTINCT ...) to avoid double-counting.
export function findMvpProviders(limit = 10) {
  return query(
    `SELECT u.user_id, u.full_name, u.user_token, u.profile_image_url,
            array_agg(DISTINCT sc.category_name ORDER BY sc.category_name) AS categories,
            COUNT(DISTINCT b.booking_id) FILTER (WHERE b.booking_status = 'COMPLETED') AS completed_job_count,
            ROUND(AVG(r.rating), 2) AS average_rating
     FROM service_provider_profiles spp
     JOIN users u ON u.user_id = spp.provider_user_id
     JOIN provider_service_categories psc ON psc.provider_user_id = spp.provider_user_id
     JOIN service_categories sc ON sc.service_category_id = psc.service_category_id
     LEFT JOIN bookings b ON b.provider_user_id = spp.provider_user_id
     LEFT JOIN reviews r ON r.booking_id = b.booking_id
     LEFT JOIN user_bans ub ON ub.user_id = spp.provider_user_id AND ub.ban_status = 'ACTIVE'
     WHERE spp.verification_status = 'APPROVED' AND ub.user_ban_id IS NULL
     GROUP BY u.user_id, u.full_name, u.user_token, u.profile_image_url
     ORDER BY completed_job_count DESC, average_rating DESC NULLS LAST, u.full_name
     LIMIT $1`,
    [limit],
  );
}
