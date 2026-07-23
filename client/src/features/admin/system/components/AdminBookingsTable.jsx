import { downloadTrackedInvoice } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

const STATUS_VARIANT = {
  PENDING: 'is-warning',
  ACCEPTED: 'is-info',
  COMPLETED: 'is-success',
  REJECTED: 'is-error',
  CANCELLED: 'is-neutral',
};

export default function AdminBookingsTable({ bookings }) {
  const { showError } = useAlert();

  if (bookings.length === 0) {
    return <p className="empty-state">No bookings match your search.</p>;
  }

  async function handleDownloadInvoice(bookingId) {
    try {
      await downloadTrackedInvoice(bookingId);
    } catch (error) {
      showError(extractErrorMessage(error));
    }
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Client</th>
            <th>Service Provider</th>
            <th>Category</th>
            <th>Scheduled</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.bookingId}>
              <td>#{booking.bookingId}</td>
              <td>
                {booking.clientName}
                <br />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{booking.clientToken}</span>
              </td>
              <td>
                {booking.providerName}
                <br />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{booking.providerToken}</span>
              </td>
              <td>{booking.serviceCategory}</td>
              <td>{new Date(booking.scheduledAt).toLocaleString()}</td>
              <td>
                <span className={`status-badge ${STATUS_VARIANT[booking.bookingStatus] ?? 'is-neutral'}`}>
                  {booking.bookingStatus}
                </span>
              </td>
              <td>{booking.paymentMethod ?? '—'}</td>
              <td>
                {booking.bookingStatus === 'COMPLETED' && booking.hasInvoice ? (
                  <button type="button" className="btn btn-outline" onClick={() => handleDownloadInvoice(booking.bookingId)}>
                    Download
                  </button>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
