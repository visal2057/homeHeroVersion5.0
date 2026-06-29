import { useEffect, useState, useCallback } from 'react';
import { bookingApi } from '../bookingApi.js';
import BookingTabs from '../components/BookingTabs.jsx';
import RequestsTable from '../components/RequestsTable.jsx';
import JobsToDoTable from '../components/JobsToDoTable.jsx';
import CompletedJobsTable from '../components/CompletedJobsTable.jsx';

const MOCK_BOOKINGS = [
  { id: '1', providerName: 'Nimal Perera', category: 'Gardening', scheduledAt: '2026-07-10T09:00:00.000Z', status: 'ACCEPTED' },
  { id: '2', providerName: 'Kamal Silva', category: 'Cleaning', scheduledAt: '2026-07-15T10:00:00.000Z', status: 'PENDING' },
  { id: '3', providerName: 'Sitha Fernando', category: 'Pet Care', completedAt: '2026-06-20T14:00:00.000Z', paymentMethod: 'CARD', status: 'COMPLETED' },
];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data?.data ?? res.data ?? []);
    } catch {
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const requests = bookings.filter((b) => ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'].includes(b.status));
  const jobs = bookings.filter((b) => b.status === 'ACCEPTED');
  const completed = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div style={{ padding: 'var(--space-2xl) 0 var(--space-2xl)' }}>
      <div className="container">
        {/* Page header */}
        <div className="mb-page-header">
          <h1 className="mb-title">📋 My Bookings</h1>
          <p className="mb-sub">Track all your service booking requests and jobs</p>
        </div>

        {/* Summary chips */}
        <div className="mb-summary">
          <div className="mb-chip mb-chip-pending">
            <span className="mb-chip-num">{bookings.filter((b) => b.status === 'PENDING').length}</span>
            <span>Pending</span>
          </div>
          <div className="mb-chip mb-chip-upcoming">
            <span className="mb-chip-num">{jobs.length}</span>
            <span>Upcoming</span>
          </div>
          <div className="mb-chip mb-chip-done">
            <span className="mb-chip-num">{completed.length}</span>
            <span>Completed</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-neutral-500)' }}>
            <div className="ep-spinner" style={{ margin: '0 auto var(--space-md)' }} />
            <p>Loading your bookings...</p>
            <style>{`.ep-spinner { width: 40px; height: 40px; border: 3px solid var(--color-neutral-200); border-top-color: var(--color-primary-500); border-radius: 50%; animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="mb-table-wrap">
            {activeTab === 'requests' && <RequestsTable bookings={requests} onRefresh={fetchBookings} />}
            {activeTab === 'jobs' && <JobsToDoTable bookings={jobs} />}
            {activeTab === 'completed' && <CompletedJobsTable bookings={completed} onRefresh={fetchBookings} />}
          </div>
        )}
      </div>

      <style>{`
        .mb-page-header { margin-bottom: var(--space-xl); }
        .mb-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: 4px; }
        .mb-sub { color: var(--color-neutral-500); }
        .mb-summary { display: flex; gap: var(--space-md); margin-bottom: var(--space-xl); flex-wrap: wrap; }
        .mb-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 20px; border-radius: var(--radius-md);
          background: white; border: 1px solid var(--color-neutral-200);
          font-size: var(--font-size-sm); font-weight: 600; color: var(--color-neutral-700);
        }
        .mb-chip-num { font-size: var(--font-size-xl); font-weight: 800; }
        .mb-chip-pending .mb-chip-num { color: #d97706; }
        .mb-chip-upcoming .mb-chip-num { color: var(--color-primary-600); }
        .mb-chip-done .mb-chip-num { color: var(--color-secondary-700); }
        .mb-table-wrap { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-neutral-200); overflow: hidden; }
      `}</style>
    </div>
  );
}
