import { findProviderBySearch, findCompletedJobsForProvider } from './sp-tracking.queries.js';

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

export async function searchProviderJobs(search) {
  const trimmed = (search ?? '').trim();
  if (!trimmed) {
    return { provider: null, jobs: [] };
  }

  const { rows: providerRows } = await findProviderBySearch(trimmed);
  if (providerRows.length === 0) {
    return { provider: null, jobs: [] };
  }

  const providerRow = providerRows[0];
  const { rows: jobRows } = await findCompletedJobsForProvider(providerRow.user_id);

  return {
    provider: {
      providerUserId: providerRow.user_id,
      fullName: providerRow.full_name,
      userToken: providerRow.user_token,
    },
    jobs: jobRows.map(toJobDto),
  };
}
