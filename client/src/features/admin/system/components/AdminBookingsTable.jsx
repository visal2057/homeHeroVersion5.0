import { formatTimeRange } from '../../../../utils/timeUtils.js';

const STATUS_VARIANT = {
  PENDING: 'is-warning',
  ACCEPTED: 'is-info',
  COMPLETED: 'is-success',
  REJECTED: 'is-error',
  CANCELLED: 'is-neutral',
};

export default function AdminBookingsTable({ bookings }) {
  if (bookings.length === 0) {
    return <p className="empty-state">No bookings match your search.</p>;
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
              <td>
                {new Date(booking.scheduledAt).toLocaleDateString()}, {formatTimeRange(booking.scheduledAt, booking.scheduledEndAt)}
              </td>
              <td>
                <span className={`status-badge ${STATUS_VARIANT[booking.bookingStatus] ?? 'is-neutral'}`}>
                  {booking.bookingStatus}
                </span>
              </td>
              <td>{booking.paymentMethod ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
