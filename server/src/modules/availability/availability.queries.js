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
