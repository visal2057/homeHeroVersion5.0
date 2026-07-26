import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import { useAuth } from '../../../hooks/useAuth.js';
import AlertMessage from '../../../components/common/AlertMessage.jsx';

import OnlineStatusControl   from '../components/OnlineStatusControl.jsx';
import OfflineDateRangePicker from '../components/OfflineDateRangePicker.jsx';
import ProviderSummaryCard   from '../components/ProviderSummaryCard.jsx';
import ProviderStatistics    from '../components/ProviderStatistics.jsx';
import AcceptancePieChart    from '../components/AcceptancePieChart.jsx';
import RecentRequests        from '../components/RecentRequests.jsx';

const DASHBOARD_HERO_IMAGE =
  'https://images.unsplash.com/photo-1668189777890-495c36095340?auto=format&fit=crop&w=1600&q=80';
const POLL_INTERVAL_MS = 30_000; // keep Recent Booking Requests + stats current without a manual refresh

export default function ProviderDashboardPage() {
  const { user } = useAuth();

  const [profile,          setProfile]          = useState(null);
  const [stats,            setStats]            = useState(null);
  const [totalEarnings,    setTotalEarnings]    = useState(null);
  const [recentRequests,   setRecentRequests]   = useState([]);
  const [isOnline,         setIsOnline]         = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [togglingStatus,   setTogglingStatus]   = useState(false);
  const [showOfflinePicker, setShowOfflinePicker] = useState(false);
  const [statusError,      setStatusError]      = useState('');

  useEffect(() => {
    // silent=true (the poll below) only ever refreshes stats + recent
    // requests -- it deliberately leaves profile/isOnline alone so a poll
    // firing mid-toggle can't fight with patchAvailability's own state, and
    // never touches loading so it can't flash a spinner over the page.
    async function load(silent = false) {
      if (silent) {
        try {
          const [statsRes, bookingsRes] = await Promise.allSettled([
            axiosClient.get(API_ENDPOINTS.PROVIDER.STATS),
            axiosClient.get(API_ENDPOINTS.PROVIDER.BOOKINGS + '?limit=5'),
          ]);
          if (statsRes.status === 'fulfilled') {
            setStats(statsRes.value.data?.data ?? statsRes.value.data);
          }
          if (bookingsRes.status === 'fulfilled') {
            const list = bookingsRes.value.data?.data ?? bookingsRes.value.data ?? [];
            setRecentRequests(Array.isArray(list) ? list : []);
          }
        } catch {
          /* non-critical background refresh */
        }
        return;
      }

      try {
        const [profileRes, statsRes, bookingsRes, earningsRes] = await Promise.allSettled([
          axiosClient.get(API_ENDPOINTS.PROVIDER.PROFILE),
          axiosClient.get(API_ENDPOINTS.PROVIDER.STATS),
          axiosClient.get(API_ENDPOINTS.PROVIDER.BOOKINGS + '?limit=5'),
          axiosClient.get(API_ENDPOINTS.PROVIDER.EARNINGS_TOTAL),
        ]);

        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value.data?.data ?? profileRes.value.data;
          setProfile(p);
          setIsOnline(p?.manualOnline ?? false);
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data?.data ?? statsRes.value.data);
        }
        if (bookingsRes.status === 'fulfilled') {
          const list = bookingsRes.value.data?.data ?? bookingsRes.value.data ?? [];
          setRecentRequests(Array.isArray(list) ? list : []);
        }
        if (earningsRes.status === 'fulfilled') {
          const e = earningsRes.value.data?.data ?? earningsRes.value.data;
          setTotalEarnings(e?.totalEarnings ?? 0);
        }
      } catch {
        // pages degrade gracefully — empty state is shown instead
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function patchAvailability(manualOnline) {
    setTogglingStatus(true);
    setStatusError('');
    try {
      await axiosClient.patch(API_ENDPOINTS.PROVIDER.AVAILABILITY, { manualOnline });
      setIsOnline(manualOnline);
    } catch (err) {
      setStatusError(err?.response?.data?.message ?? 'Could not update availability. Please try again.');
    } finally {
      setTogglingStatus(false);
    }
  }

  function handleToggleStatus() {
    if (isOnline) {
      // Going offline opens the date-range picker instead of toggling immediately.
      setShowOfflinePicker(true);
      return;
    }
    patchAvailability(true);
  }

  async function handleConfirmOffline(dateKeys) {
    setTogglingStatus(true);
    setStatusError('');
    try {
      const { data } = await axiosClient.get(API_ENDPOINTS.PROVIDER.UNAVAILABLE_DATES);
      const existing = data?.data ?? data ?? [];
      const merged = [...new Set([...(Array.isArray(existing) ? existing : []), ...dateKeys])];
      // Blocking specific dates must not flip the account-wide manualOnline
      // flag: that flag drives search visibility and bookability on every
      // date, not just the ones picked here. The provider stays online and
      // bookable outside this range, same as the Jobs To Do calendar.
      await axiosClient.put(API_ENDPOINTS.PROVIDER.UNAVAILABLE_DATES, { dates: merged });
      setShowOfflinePicker(false);
    } catch (err) {
      setStatusError(err?.response?.data?.message ?? 'Could not save unavailable dates. Please try again.');
    } finally {
      setTogglingStatus(false);
    }
  }

  const greetingName = profile?.fullName?.split(' ')[0] ?? user?.username ?? 'Provider';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const bookability = profile?.bookability;
  const eligibleToGoOnline = Boolean(
    bookability?.isVerified && bookability?.hasValidMembershipOrGrace && !bookability?.hasActiveBan
  );
  const ineligibleReason = bookability && !eligibleToGoOnline ? bookability.reason : null;

  return (
    <div className="provider-page">
      {/* Hero banner */}
      <section className="provider-hero">
        <div className="provider-hero-bg" style={{ backgroundImage: `url(${DASHBOARD_HERO_IMAGE})` }} role="img" aria-label="Service provider at work" />
        <div className="provider-hero-overlay" aria-hidden="true" />
        <div className="provider-hero-inner">
          <div>
            <h1 className="provider-hero-greeting">{greeting}, {greetingName}</h1>
            <p className="provider-hero-sub">Here's what's happening with your business today.</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : (
        <>
          {/* Availability + Summary */}
          <div className="provider-top-grid">
            <div className="provider-card">
              <div className="provider-card-header">
                <h2 className="provider-card-title">Availability</h2>
              </div>
              <div className="provider-card-body">
                {statusError && <AlertMessage type="error" message={statusError} />}
                <OnlineStatusControl
                  isOnline={isOnline}
                  eligible={eligibleToGoOnline}
                  ineligibleReason={ineligibleReason}
                  onToggle={handleToggleStatus}
                  loading={togglingStatus}
                />
                {showOfflinePicker && (
                  <OfflineDateRangePicker
                    onConfirm={handleConfirmOffline}
                    onCancel={() => setShowOfflinePicker(false)}
                    saving={togglingStatus}
                  />
                )}
              </div>
            </div>

            <ProviderSummaryCard profile={profile} />
          </div>

          {/* Stats */}
          <ProviderStatistics stats={stats} totalEarnings={totalEarnings} />

          <div className="provider-dashboard-grid">
            {/* Left column */}
            <div className="provider-card">
              <div className="provider-card-header">
                <h2 className="provider-card-title">Recent Booking Requests</h2>
              </div>
              <RecentRequests requests={recentRequests} />
            </div>

            {/* Right column */}
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
        </>
      )}
    </div>
  );
}
