import { useEffect, useState, useCallback } from 'react';
import { bookingApi } from '../bookingApi.js';
import BookingTabs from '../components/BookingTabs.jsx';
import RequestsTable from '../components/RequestsTable.jsx';
import JobsToDoTable from '../components/JobsToDoTable.jsx';
import CompletedJobsTable from '../components/CompletedJobsTable.jsx';
import { IconClipboardList } from '../../../components/common/icons.jsx';

const MOCK_BOOKINGS = [
  { id: '1', bookingId: '1', providerName: 'Nimal Perera', providerToken: 'NPR4X2', category: 'Gardening', scheduledAt: '2026-07-10T09:00:00.000Z', status: 'ACCEPTED' },
  { id: '2', bookingId: '2', providerName: 'Kamal Silva', providerToken: 'KSL7Y9', category: 'Cleaning', scheduledAt: '2026-07-15T10:00:00.000Z', status: 'PENDING' },
  { id: '3', bookingId: '3', providerName: 'Sitha Fernando', providerToken: 'SFN2M1', category: 'Pet Care', completedAt: '2026-06-20T14:00:00.000Z', paymentMethod: 'CARD', status: 'COMPLETED' },
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
    <div className="mb-page">
      {/* Hero */}
      <div className="mb-hero">
        <div className="mb-hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="mb-hero-inner">
            <div className="mb-hero-icon">
              <IconClipboardList size={32} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>Your Account</div>
              <h1 className="mb-hero-title">My Bookings</h1>
              <p className="mb-hero-sub">Track all your service requests and jobs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-body">
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-neutral-500)' }}>
            <div className="mb-spinner" />
            <p>Loading your bookings...</p>
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
        .mb-page { padding-bottom: var(--space-2xl); }
        .mb-hero {
          position: relative; background-image: url('https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=2000&q=80');
          background-size: cover; background-position: center; padding: 64px 0;
        }
        .mb-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,45,25,0.60) 0%, rgba(21,128,61,0.42) 100%);
        }
        .mb-hero-inner { display: flex; align-items: center; gap: var(--space-xl); }
        .mb-hero-icon {
          width: 64px; height: 64px; border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .mb-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 6px; }
        .mb-hero-sub { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin: 0; }
        .mb-body { padding-top: var(--space-2xl); }
        .mb-summary { display: flex; gap: var(--space-md); margin-bottom: var(--space-xl); flex-wrap: wrap; }
        .mb-chip {
          display: flex; align-items: center; gap: 10px; padding: 12px 20px;
          border-radius: var(--radius-md); background: white;
          border: 1px solid var(--color-neutral-200);
          font-size: var(--font-size-sm); font-weight: 600; color: var(--color-neutral-700);
        }
        .mb-chip-num { font-size: var(--font-size-xl); font-weight: 800; }
        .mb-chip-pending .mb-chip-num { color: #d97706; }
        .mb-chip-upcoming .mb-chip-num { color: var(--color-primary-600); }
        .mb-chip-done .mb-chip-num { color: var(--color-secondary-700); }
        .mb-table-wrap { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-neutral-200); overflow: hidden; }
        .mb-spinner { width: 40px; height: 40px; border: 3px solid var(--color-neutral-200); border-top-color: var(--color-primary-500); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto var(--space-md); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
