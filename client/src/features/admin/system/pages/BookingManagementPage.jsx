import { useEffect, useState } from 'react';
import AdminBookingsTable from '../components/AdminBookingsTable.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchBookings } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

const STATUS_OPTIONS = ['PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useAlert();

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      fetchBookings({ search: search || undefined, status: status || undefined, period: period || undefined })
        .then(({ data }) => setBookings(data.data.bookings))
        .catch((error) => showError(extractErrorMessage(error)))
        .finally(() => setIsLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, status, period, showError]);

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">Bookings Management</h1>
          <p className="section-subtitle">Monitor every booking across the platform.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="form-control"
          placeholder="Search by Booking ID, name or token"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="form-control" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select className="form-control" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="">All time</option>
          <option value="this_month">This month</option>
          <option value="last_month">Last month</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <AdminBookingsTable bookings={bookings} />
      )}
    </div>
  );
}
