import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderRequestTable from '../components/ProviderRequestTable.jsx';
import ProviderPageHero from '../components/ProviderPageHero.jsx';
import ConfirmModal from '../../../components/common/ConfirmModal.jsx';
import AlertMessage from '../../../components/common/AlertMessage.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1600&q=80';

export default function ProviderRequestsPage() {
  const [requests, setRequests]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [acting,   setActing]     = useState(false);
  const [alert,    setAlert]      = useState(null);
  const [filter,   setFilter]     = useState('all');
  const [pendingAction, setPendingAction] = useState(null); // { id, type: 'accept' | 'reject' }

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

  async function performAccept(id) {
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

  async function performReject(id) {
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

  // Accept/Reject now ask for confirmation first — the click only opens the
  // modal, the actual PATCH fires from handleConfirmAction below.
  function handleAccept(id) {
    setPendingAction({ id, type: 'accept' });
  }

  function handleReject(id) {
    setPendingAction({ id, type: 'reject' });
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;
    const { id, type } = pendingAction;
    setPendingAction(null);
    if (type === 'accept') await performAccept(id);
    else await performReject(id);
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
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <AlertMessage type={alert.type} message={alert.msg} onDismiss={() => setAlert(null)} />
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

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.type === 'reject' ? 'Reject booking' : 'Accept booking'}
        message={
          pendingAction?.type === 'reject'
            ? 'Are you sure you want to reject this booking request? This cannot be undone.'
            : 'Are you sure you want to accept this booking request?'
        }
        confirmLabel={pendingAction?.type === 'reject' ? 'Reject' : 'Accept'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
