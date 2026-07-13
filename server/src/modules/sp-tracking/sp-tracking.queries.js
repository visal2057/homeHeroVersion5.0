import { query } from '../../db/query.js';

// Matches a Service Provider by exact 6-character token or partial name,
// scoped to the SERVICE_PROVIDER role. An exact token match is ranked first
// so a token search never gets shadowed by an unrelated name substring hit.
export function findProviderBySearch(search) {
  return query(
    `SELECT u.user_id, u.full_name, u.user_token
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
    `SELECT b.booking_id, b.job_description, b.scheduled_at, b.completed_at,
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
