import { query } from '../../db/query.js';

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
