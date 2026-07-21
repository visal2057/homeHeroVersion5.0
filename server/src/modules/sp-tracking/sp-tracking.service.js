import {
  findProviderBySearch,
  findCompletedJobsForProvider,
  findProviderStats,
  findMvpProviders,
} from './sp-tracking.queries.js';

// Amount shown per spec §40.4: the system-recorded amount for a Card-paid
// job (booking_payments.service_amount), or the invoiced amount for a
// Cash-paid job if the provider generated one -- otherwise no figure exists.
function resolveAmount(row) {
  if (row.payment_method === 'CARD') {
    return row.service_amount !== null ? Number(row.service_amount) : null;
  }
  return row.invoice_amount !== null ? Number(row.invoice_amount) : null;
}

function toJobDto(row) {
  return {
    bookingId: row.booking_id,
    clientName: row.client_name,
    clientToken: row.client_token,
    serviceCategory: row.service_category,
    jobDescription: row.job_description,
    jobLocation: row.job_location,
    bookingDate: row.scheduled_at,
    completionDate: row.completed_at,
    paymentMethod: row.payment_method,
    amount: resolveAmount(row),
    hasInvoice: row.invoice_id !== null,
  };
}

function toStatsDto(row) {
  return {
    bookingsReceived: Number(row.received ?? 0),
    bookingsAccepted: Number(row.accepted ?? 0),
    bookingsRejected: Number(row.rejected ?? 0),
    completedJobs: Number(row.completed ?? 0),
    averageRating: row.average_rating !== null ? Number(row.average_rating) : null,
    reviewCount: Number(row.review_count ?? 0),
    totalEarnings: Number(row.total_earnings ?? 0),
    membershipsBought: Number(row.memberships_bought ?? 0),
  };
}

function toMvpDto(row) {
  return {
    providerUserId: row.user_id,
    fullName: row.full_name,
    userToken: row.user_token,
    profileImageUrl: row.profile_image_url ?? null,
    categories: (row.categories ?? []).filter(Boolean),
    completedJobCount: Number(row.completed_job_count ?? 0),
    averageRating: row.average_rating !== null ? Number(row.average_rating) : null,
  };
}

export async function searchProviderJobs(search) {
  const trimmed = (search ?? '').trim();
  if (!trimmed) {
    return { provider: null, jobs: [], stats: null };
  }

  const { rows: providerRows } = await findProviderBySearch(trimmed);
  if (providerRows.length === 0) {
    return { provider: null, jobs: [], stats: null };
  }

  const providerRow = providerRows[0];
  const [{ rows: jobRows }, { rows: statsRows }] = await Promise.all([
    findCompletedJobsForProvider(providerRow.user_id),
    findProviderStats(providerRow.user_id),
  ]);

  return {
    provider: {
      providerUserId: providerRow.user_id,
      fullName: providerRow.full_name,
      userToken: providerRow.user_token,
    },
    jobs: jobRows.map(toJobDto),
    stats: toStatsDto(statsRows[0]),
  };
}

// Live-refreshed by the SP Tracking page whenever no search is active, so
// the leaderboard reflects completed jobs across all five categories as
// they happen.
export async function getMvpProviders() {
  const { rows } = await findMvpProviders(10);
  return rows.map(toMvpDto);
}
