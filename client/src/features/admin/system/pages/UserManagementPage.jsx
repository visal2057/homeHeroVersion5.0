import { useCallback, useEffect, useState } from 'react';
import AdminUsersTable from '../components/AdminUsersTable.jsx';
import BanUserModal from '../components/BanUserModal.jsx';
import BanRequestCard from '../components/BanRequestCard.jsx';
import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchUsers, fetchBanRequests, applyBan, removeBan } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [banRequests, setBanRequests] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [banTarget, setBanTarget] = useState(null);
  const [unbanTarget, setUnbanTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useAlert();

  const loadUsers = useCallback(() => {
    setIsLoading(true);
    return Promise.all([
      fetchUsers({ role: role || undefined, search: search || undefined, bookingId: bookingId || undefined }),
      fetchBanRequests(),
    ])
      .then(([usersRes, banRes]) => {
        setUsers(usersRes.data.data.users);
        setBanRequests(banRes.data.data.banRequests);
      })
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [role, search, bookingId, showError]);

  useEffect(() => {
    const timeout = setTimeout(loadUsers, 250);
    return () => clearTimeout(timeout);
  }, [loadUsers]);

  async function handleApplyBan(payload) {
    setIsSubmitting(true);
    try {
      await applyBan({
        userId: banTarget.requestedUserId ?? banTarget.userId,
        sourceBanRequestId: banTarget.banRequestId ?? null,
        ...payload,
      });
      showSuccess('User has been banned.');
      setBanTarget(null);
      await loadUsers();
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnban() {
    setIsSubmitting(true);
    try {
      await removeBan(unbanTarget.ban.userBanId);
      showSuccess('Ban removed.');
      setUnbanTarget(null);
      await loadUsers();
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Search Clients and Service Providers, and act on ban recommendations.</p>
        </div>
      </div>

      {banRequests.length > 0 && (
        <div className="card chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3>Pending Ban Requests from Verification Admin</h3>
          {banRequests.map((request) => (
            <BanRequestCard key={request.banRequestId} request={request} onApply={setBanTarget} />
          ))}
        </div>
      )}

      <div className="admin-toolbar">
        <input
          className="form-control"
          placeholder="Search by name, username or token"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="form-control" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">All roles</option>
          <option value="CLIENT">Clients</option>
          <option value="SERVICE_PROVIDER">Service Providers</option>
        </select>
        <input
          className="form-control"
          type="number"
          placeholder="Search by Booking ID"
          value={bookingId}
          onChange={(event) => setBookingId(event.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <AdminUsersTable users={users} onBan={setBanTarget} onUnban={setUnbanTarget} />
      )}

      <BanUserModal
        isOpen={Boolean(banTarget)}
        onClose={() => setBanTarget(null)}
        onSubmit={handleApplyBan}
        targetName={banTarget?.fullName ?? banTarget?.requestedUserName}
        isSubmitting={isSubmitting}
        recommendation={banTarget}
      />

      <ConfirmModal
        isOpen={Boolean(unbanTarget)}
        title="Remove ban"
        message={`Remove the ban on ${unbanTarget?.fullName}?`}
        confirmLabel="Unban"
        onConfirm={handleUnban}
        onCancel={() => setUnbanTarget(null)}
      />
    </div>
  );
}
