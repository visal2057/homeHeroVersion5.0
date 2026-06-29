import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import { useAuth } from '../../../hooks/useAuth.js';

import OnlineStatusControl from '../components/OnlineStatusControl.jsx';
import ProviderSummaryCard  from '../components/ProviderSummaryCard.jsx';
import ProviderStatistics   from '../components/ProviderStatistics.jsx';
import AcceptancePieChart   from '../components/AcceptancePieChart.jsx';
import RecentRequests       from '../components/RecentRequests.jsx';

export default function ProviderDashboardPage() {
  const { user } = useAuth();

  const [profile,          setProfile]          = useState(null);
  const [stats,            setStats]            = useState(null);
  const [recentRequests,   setRecentRequests]   = useState([]);
  const [isOnline,         setIsOnline]         = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [togglingStatus,   setTogglingStatus]   = useState(false);
  const [announcements,    setAnnouncements]    = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, statsRes, bookingsRes, announcementsRes] = await Promise.allSettled([
          axiosClient.get(API_ENDPOINTS.PROVIDER.PROFILE),
          axiosClient.get(API_ENDPOINTS.PROVIDER.STATS),
          axiosClient.get(API_ENDPOINTS.PROVIDER.BOOKINGS + '?limit=5'),
          axiosClient.get(API_ENDPOINTS.PROVIDER.ANNOUNCEMENTS),
        ]);

        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value.data?.data ?? profileRes.value.data;
          setProfile(p);
          setIsOnline(p?.is_available ?? false);
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data?.data ?? statsRes.value.data);
        }
        if (bookingsRes.status === 'fulfilled') {
          const list = bookingsRes.value.data?.data ?? bookingsRes.value.data ?? [];
          setRecentRequests(Array.isArray(list) ? list : []);
        }
        if (announcementsRes.status === 'fulfilled') {
          const list = announcementsRes.value.data?.data ?? announcementsRes.value.data ?? [];
          setAnnouncements(Array.isArray(list) ? list : []);
        }
      } catch {
        // pages degrade gracefully — empty state is shown instead
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleToggleStatus() {
    setTogglingStatus(true);
    try {
      const next = !isOnline;
      await axiosClient.patch(API_ENDPOINTS.PROVIDER.AVAILABILITY, { is_available: next });
      setIsOnline(next);
    } catch {
      // keep current state on failure
    } finally {
      setTogglingStatus(false);
    }
  }

  const greetingName = profile?.name?.split(' ')[0] ?? user?.username ?? 'Provider';

  return (
    <div className="provider-page">
      {/* Greeting */}
      <div className="provider-page-header">
        <div>
          <h1 className="provider-page-title">Welcome back, {greetingName} 👋</h1>
          <p className="provider-page-subtitle">Here's what's happening with your business today.</p>
        </div>
        <OnlineStatusControl
          isOnline={isOnline}
          onToggle={handleToggleStatus}
          loading={togglingStatus}
        />
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          {announcements.map((a) => (
            <div key={a.id} className="provider-alert warning">
              📢 <strong>{a.title}:</strong> {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : (
        <>
          <ProviderStatistics stats={stats} />

          <div className="provider-dashboard-grid">
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              {/* Recent Requests */}
              <div className="provider-card">
                <div className="provider-card-header">
                  <h2 className="provider-card-title">Recent Booking Requests</h2>
                </div>
                <RecentRequests requests={recentRequests} />
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              <ProviderSummaryCard profile={profile} />

              {/* Acceptance chart */}
              <div className="provider-card">
                <div className="provider-card-header">
                  <h2 className="provider-card-title">Request Acceptance</h2>
                </div>
                <div className="provider-card-body">
                  <AcceptancePieChart
                    accepted={stats?.accepted_bookings ?? 0}
                    rejected={stats?.rejected_bookings ?? 0}
                    pending={stats?.pending_requests   ?? 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
