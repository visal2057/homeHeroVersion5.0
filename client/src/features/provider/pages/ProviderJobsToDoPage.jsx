import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderJobsTable       from '../components/ProviderJobsTable.jsx';
import UnavailableDateCalendar from '../components/UnavailableDateCalendar.jsx';
import ProviderPageHero        from '../components/ProviderPageHero.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1600&q=80';
const POLL_INTERVAL_MS = 30_000; // pick up a newly-accepted reschedule (decided in another tab/device) without a manual refresh

export default function ProviderJobsToDoPage() {
  const [jobs,             setJobs]             = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [calendarSaving,   setCalendarSaving]   = useState(false);

  useEffect(() => {
    // silent=true (the poll below) only ever refreshes the jobs table, never
    // touches loading/unavailableDates, so it can't flash a spinner over an
    // already-loaded page or clobber an in-progress calendar edit.
    async function load(silent = false) {
      if (!silent) {
        try {
          const [jobsRes, datesRes] = await Promise.allSettled([
            axiosClient.get(API_ENDPOINTS.PROVIDER.JOBS),
            axiosClient.get(API_ENDPOINTS.PROVIDER.UNAVAILABLE_DATES),
          ]);
          if (jobsRes.status === 'fulfilled') {
            const list = jobsRes.value.data?.data ?? jobsRes.value.data ?? [];
            setJobs(Array.isArray(list) ? list : []);
          }
          if (datesRes.status === 'fulfilled') {
            const list = datesRes.value.data?.data ?? datesRes.value.data ?? [];
            setUnavailableDates(Array.isArray(list) ? list : []);
          }
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const { data } = await axiosClient.get(API_ENDPOINTS.PROVIDER.JOBS);
          const list = data?.data ?? data ?? [];
          setJobs(Array.isArray(list) ? list : []);
        } catch {
          /* non-critical background refresh */
        }
      }
    }
    load();
    const interval = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleToggleDate(dateKey) {
    const next = unavailableDates.includes(dateKey)
      ? unavailableDates.filter((d) => d !== dateKey)
      : [...unavailableDates, dateKey];

    setUnavailableDates(next);
    setCalendarSaving(true);
    try {
      await axiosClient.put(API_ENDPOINTS.PROVIDER.UNAVAILABLE_DATES, { dates: next });
    } catch {
      setUnavailableDates(unavailableDates); // revert
    } finally {
      setCalendarSaving(false);
    }
  }

  return (
    <div className="provider-page">
      <ProviderPageHero
        title="Jobs To Do"
        subtitle="Accepted bookings you need to complete."
        image={HERO_IMAGE}
      />

      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Active jobs table */}
          <div className="provider-card">
            <div className="provider-card-header">
              <h2 className="provider-card-title">Active Jobs ({jobs.length})</h2>
            </div>
            <ProviderJobsTable jobs={jobs} />
          </div>

          {/* Availability calendar */}
          <div className="provider-card">
            <div className="provider-card-header">
              <h2 className="provider-card-title">Manage Availability</h2>
              {calendarSaving && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Saving…</span>
              )}
            </div>
            <div className="provider-card-body">
              <UnavailableDateCalendar
                unavailableDates={unavailableDates}
                onToggleDate={handleToggleDate}
                jobs={jobs}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
