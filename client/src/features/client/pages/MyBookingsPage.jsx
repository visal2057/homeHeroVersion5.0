import { useEffect, useState, useCallback } from 'react';
import { bookingApi } from '../bookingApi.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { onBookingsChanged } from '../../../utils/bookingEvents.js';
import BookingTabs from '../components/BookingTabs.jsx';
import RequestsTable from '../components/RequestsTable.jsx';
import JobsToDoTable from '../components/JobsToDoTable.jsx';
import CompletedJobsTable from '../components/CompletedJobsTable.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import PageHero from '../../../components/common/PageHero.jsx';
import RevealOnScroll from '../../../components/common/RevealOnScroll.jsx';
import { SkeletonRows } from '../../../components/common/Skeleton.jsx';
import { IconClipboardList, IconAlertCircle } from '../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=2000&q=80';

const POLL_INTERVAL_MS = 30_000; // pick up changes made elsewhere (e.g. a reschedule decided from another tab/device)

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // silent=true is used by the poll/event refresh below so a background
  // refetch never flashes the spinner or clobbers good data with an error.
  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data?.data ?? res.data ?? []);
    } catch (err) {
      if (!silent) {
        setBookings([]);
        setError(extractErrorMessage(err));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const unsubscribe = onBookingsChanged(() => fetchBookings(true));
    const interval = setInterval(() => fetchBookings(true), POLL_INTERVAL_MS);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [fetchBookings]);

  const requests = bookings.filter((b) => ['PENDING', 'REJECTED', 'CANCELLED', 'RESCHEDULE_PENDING'].includes(b.status));
  const jobs = bookings.filter((b) => b.status === 'ACCEPTED');
  const completed = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="mb-page">
      <PageHero
        image={HERO_IMAGE}
        icon={IconClipboardList}
        eyebrow="Your Account"
        title="My Bookings"
        subtitle="Track all your service requests and jobs"
      />

      <div className="container mb-body">
        {/* Summary chips */}
        <RevealOnScroll className="mb-summary" y={12}>
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
        </RevealOnScroll>

        {/* Tabs */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="mb-table-wrap">
            <SkeletonRows count={5} />
          </div>
        ) : error ? (
          <div className="mb-table-wrap">
            <EmptyState
              icon={IconAlertCircle}
              tone="error"
              title="Couldn't load your bookings"
              message={error}
              actionLabel="Try Again"
              onAction={fetchBookings}
            />
          </div>
        ) : (
          <RevealOnScroll className="mb-table-wrap" y={16}>
            {activeTab === 'requests' && <RequestsTable bookings={requests} onRefresh={fetchBookings} />}
            {activeTab === 'jobs' && <JobsToDoTable bookings={jobs} onRefresh={fetchBookings} />}
            {activeTab === 'completed' && <CompletedJobsTable bookings={completed} onRefresh={fetchBookings} />}
          </RevealOnScroll>
        )}
      </div>

      <style>{`
        .mb-page { padding-bottom: var(--space-2xl); }
        .mb-body { padding-top: var(--space-2xl); }
        .mb-summary { display: flex; gap: var(--space-md); margin-bottom: var(--space-xl); flex-wrap: wrap; }
        .mb-chip {
          display: flex; align-items: center; gap: 12px; padding: 14px 24px;
          border-radius: var(--radius-md); background: white;
          border: 1px solid var(--color-neutral-200);
          font-size: var(--font-size-sm); font-weight: 600; color: var(--color-neutral-700);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }
        .mb-chip:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .mb-chip-num { font-size: var(--font-size-xl); font-weight: 800; }
        .mb-chip-pending .mb-chip-num { color: #d97706; }
        .mb-chip-upcoming .mb-chip-num { color: var(--color-primary-600); }
        .mb-chip-done .mb-chip-num { color: var(--color-secondary-700); }
        .mb-table-wrap { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-neutral-200); overflow: hidden; }
      `}</style>
    </div>
  );
}
