import { query } from '../../db/query.js';

export function getBookability(providerUserId) {
  return query(`SELECT * FROM vw_provider_bookability WHERE provider_user_id = $1`, [providerUserId]);
}

export function setManualOnline(providerUserId, manualOnline) {
  return query(
    `UPDATE service_provider_profiles SET manual_online = $1, updated_at = now() WHERE provider_user_id = $2 RETURNING manual_online`,
    [manualOnline, providerUserId],
  );
}

// Today's live availability picture: is the account-wide switch on, does
// today fall inside one of the provider's own unavailable_periods, and is
// there an active same-day override. Computed fresh against CURRENT_DATE
// rather than stored, so both "is_unavailable_today" and
// "override_active_today" resolve correctly with zero background job.
export function getTodayAvailabilityState(providerUserId) {
  return query(
    `SELECT spp.manual_online,
            EXISTS (
              SELECT 1 FROM provider_unavailable_periods p
              WHERE p.provider_user_id = spp.provider_user_id
                AND CURRENT_DATE BETWEEN p.unavailable_from AND p.unavailable_to
            ) AS is_unavailable_today,
            COALESCE(spp.online_override_date = CURRENT_DATE, false) AS override_active_today
     FROM service_provider_profiles spp
     WHERE spp.provider_user_id = $1`,
    [providerUserId],
  );
}

// Turning the override on also ensures manual_online is true (the provider
// is asking to be bookable), in one atomic statement rather than two
// sequential writes. Turning it off only clears the override date -
// manual_online is left exactly as it was.
export function setOnlineOverrideDate(providerUserId, active) {
  return query(
    `UPDATE service_provider_profiles
     SET manual_online = CASE WHEN $1 THEN true ELSE manual_online END,
         online_override_date = CASE WHEN $1 THEN CURRENT_DATE ELSE NULL END,
         updated_at = now()
     WHERE provider_user_id = $2
     RETURNING manual_online, online_override_date`,
    [active, providerUserId],
  );
}

export function listFutureUnavailablePeriods(providerUserId) {
  return query(
    `SELECT unavailable_from, unavailable_to FROM provider_unavailable_periods
     WHERE provider_user_id = $1 AND unavailable_to >= CURRENT_DATE
     ORDER BY unavailable_from`,
    [providerUserId],
  );
}

export function deleteFutureUnavailablePeriods(client, providerUserId) {
  return client.query(
    `DELETE FROM provider_unavailable_periods WHERE provider_user_id = $1 AND unavailable_to >= CURRENT_DATE`,
    [providerUserId],
  );
}

export function insertUnavailablePeriod(client, providerUserId, fromDate, toDate) {
  return client.query(
    `INSERT INTO provider_unavailable_periods (provider_user_id, unavailable_from, unavailable_to) VALUES ($1, $2, $3)`,
    [providerUserId, fromDate, toDate],
  );
}
