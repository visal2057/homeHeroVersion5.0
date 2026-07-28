import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderRequestTable from '../components/ProviderRequestTable.jsx';
import ProviderPageHero from '../components/ProviderPageHero.jsx';
import ConfirmModal from '../../../components/common/ConfirmModal.jsx';
import RejectReasonModal from '../components/RejectReasonModal.jsx';
import RescheduleModal from '../components/RescheduleModal.jsx';
import AlertMessage from '../../../components/common/AlertMessage.jsx';
import { formatTimeRange } from '../../../utils/timeUtils.js';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1600&q=80';
const POLL_INTERVAL_MS = 30_000; // pick up a client's own accept/reject/reschedule decision without a manual refresh

const TAB_LABELS = {
  reschedule_rejected: 'Rejected Reschedules',
};
function tabLabel(f) {
  return TAB_LABELS[f] ?? (f.charAt(0).toUpperCase() + f.slice(1));
}

export default function ProviderRequestsPage() {
  const [requests, setRequests]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [acting,   setActing]     = useState(false);
  const [alert,    setAlert]      = useState(null);
  const [filter,   setFilter]     = useState('all');

  // Step 1: collect the extra input a reject/reschedule needs before the
  // final "are you sure" confirmation (step 2, below).
  const [formModal, setFormModal] = useState(null); // { id, type: 'reject' | 'reschedule' }
  // Step 2: { id, type: 'accept' | 'reject' | 'reschedule', payload? }
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchRequests(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // silent=true is used by the poll above so a background refresh never
  // flashes the spinner over an already-loaded table.
  async function fetchRequests(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await axiosClient.get(API_ENDPOINTS.PROVIDER.BOOKINGS);
      const list = res.data?.data ?? res.data ?? [];
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      if (!silent) setAlert({ type: 'error', msg: 'Failed to load requests. Please refresh.' });
    } finally {
      if (!silent) setLoading(false);
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

  async function performReject(id, reason) {
    setActing(true);
    try {
      await axiosClient.patch(API_ENDPOINTS.PROVIDER.BOOKING_REJECT(id), { reason });
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

  async function performReschedule(id, payload) {
    setActing(true);
    try {
      await axiosClient.patch(API_ENDPOINTS.PROVIDER.BOOKING_RESCHEDULE(id), payload);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'reschedule_pending' } : r))
      );
      setAlert({ type: 'success', msg: 'Reschedule proposed. The client has been notified.' });
    } catch {
      setAlert({ type: 'error', msg: 'Could not propose a reschedule. Please try again.' });
    } finally {
      setActing(false);
    }
  }

  function handleAccept(id) {
    setPendingAction({ id, type: 'accept' });
  }

  function handleReject(id) {
    setFormModal({ id, type: 'reject' });
  }

  function handleReschedule(id) {
    setFormModal({ id, type: 'reschedule' });
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;
    const { id, type, payload } = pendingAction;
    setPendingAction(null);
    if (type === 'accept') await performAccept(id);
    else if (type === 'reject') await performReject(id, payload);
    else if (type === 'reschedule') await performReschedule(id, payload);
  }

  const filtered = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter);

  const confirmCopy = (() => {
    if (pendingAction?.type === 'reject') {
      return {
        title: 'Reject booking',
        message: `Are you sure you want to reject this booking with reason: "${pendingAction.payload}"? This cannot be undone.`,
        confirmLabel: 'Reject',
      };
    }
    if (pendingAction?.type === 'reschedule') {
      const { scheduledAt, scheduledEndAt } = pendingAction.payload ?? {};
      const dateLabel = scheduledAt ? new Date(scheduledAt).toLocaleDateString('en-LK', { dateStyle: 'medium' }) : '';
      const timeLabel = formatTimeRange(scheduledAt, scheduledEndAt);
      return {
        title: 'Propose reschedule',
        message: `Are you sure you want to propose rescheduling this booking to ${dateLabel}, ${timeLabel}? The client will be notified and must accept before this takes effect.`,
        confirmLabel: 'Confirm',
      };
    }
    return {
      title: 'Accept booking',
      message: 'Are you sure you want to accept this booking request?',
      confirmLabel: 'Accept',
    };
  })();

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
        {['all', 'pending', 'accepted', 'rejected', 'reschedule_rejected'].map((f) => (
          <button
            key={f}
            type="button"
            className={`provider-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {tabLabel(f)}
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
            onReschedule={handleReschedule}
            loading={acting}
          />
        )}
      </div>

      {formModal?.type === 'reject' && (
        <RejectReasonModal
          onClose={() => setFormModal(null)}
          onConfirm={(reason) => {
            setFormModal(null);
            setPendingAction({ id: formModal.id, type: 'reject', payload: reason });
          }}
        />
      )}

      {formModal?.type === 'reschedule' && (
        <RescheduleModal
          onClose={() => setFormModal(null)}
          onConfirm={(payload) => {
            setFormModal(null);
            setPendingAction({ id: formModal.id, type: 'reschedule', payload });
          }}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.confirmLabel}
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
