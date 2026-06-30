import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderRequestTable from '../components/ProviderRequestTable.jsx';
import ProviderPageHero from '../components/ProviderPageHero.jsx';
import { IconXCircle } from '../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1600&q=80';

export default function ProviderRequestsPage() {
  const [requests, setRequests]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [acting,   setActing]     = useState(false);
  const [alert,    setAlert]      = useState(null);
  const [filter,   setFilter]     = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await axiosClient.get(API_ENDPOINTS.PROVIDER.BOOKINGS);
      const list = res.data?.data ?? res.data ?? [];
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      setAlert({ type: 'error', msg: 'Failed to load requests. Please refresh.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id) {
    setActing(true);
    try {
      await axiosClient.patch(API_ENDPOINTS.PROVIDER.BOOKING_ACCEPT(id));
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r))
      );
      setAlert({ type: 'success', msg: 'Booking accepted successfully.' });
    } catch {
      setAlert({ type: 'error', msg: 'Could not accept booking. Please try again.' });
    } finally {
      setActing(false);
    }
  }

  async function handleReject(id) {
    setActing(true);
    try {
      await axiosClient.patch(API_ENDPOINTS.PROVIDER.BOOKING_REJECT(id));
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
      );
      setAlert({ type: 'success', msg: 'Booking rejected.' });
    } catch {
      setAlert({ type: 'error', msg: 'Could not reject booking. Please try again.' });
    } finally {
      setActing(false);
    }
  }

  const filtered = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter);

  return (
    <div className="provider-page">
      <ProviderPageHero
        title="Booking Requests"
        subtitle="Review and respond to incoming service requests."
        image={HERO_IMAGE}
      />

      {alert && (
        <div className={`provider-alert ${alert.type}`} style={{ marginBottom: 'var(--space-lg)' }}>
          {alert.msg}
          <button
            type="button"
            onClick={() => setAlert(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', display: 'inline-flex' }}
            aria-label="Dismiss"
          >
            <IconXCircle size={16} />
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="provider-tabs">
        {['all', 'pending', 'accepted', 'rejected'].map((f) => (
          <button
            key={f}
            type="button"
            className={`provider-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="count">
              ({requests.filter((r) => f === 'all' ? true : r.status === f).length})
            </span>
          </button>
        ))}
      </div>

      <div className="provider-card">
        {loading ? (
          <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
        ) : (
          <ProviderRequestTable
            requests={filtered}
            onAccept={handleAccept}
            onReject={handleReject}
            loading={acting}
          />
        )}
      </div>
    </div>
  );
}
