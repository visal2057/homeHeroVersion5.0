import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderJobsTable       from '../components/ProviderJobsTable.jsx';
import UnavailableDateCalendar from '../components/UnavailableDateCalendar.jsx';

export default function ProviderJobsToDoPage() {
  const [jobs,             setJobs]             = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [calendarSaving,   setCalendarSaving]   = useState(false);

  useEffect(() => {
    async function load() {
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
    }
    load();
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
      <div className="provider-page-header">
        <div>
          <h1 className="provider-page-title">Jobs To Do</h1>
          <p className="provider-page-subtitle">Accepted bookings you need to complete.</p>
        </div>
      </div>

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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
