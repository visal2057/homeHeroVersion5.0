const STATUS_VARIANT = { APPROVED: 'is-success', PENDING: 'is-warning', REJECTED: 'is-error' };

export default function AdminUsersTable({ users, onBan, onUnban }) {
  if (users.length === 0) {
    return <p className="empty-state">No users match your search.</p>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Token</th>
            <th>Role</th>
            <th>Verification</th>
            <th>Membership</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>
                {user.fullName}
                <br />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>@{user.username}</span>
              </td>
              <td>{user.userToken}</td>
              <td>{user.role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Client'}</td>
              <td>
                {user.verificationStatus ? (
                  <span className={`status-badge ${STATUS_VARIANT[user.verificationStatus] ?? 'is-neutral'}`}>{user.verificationStatus}</span>
                ) : (
                  '—'
                )}
              </td>
              <td>{user.membershipStatus ?? '—'}</td>
              <td>
                {user.isBanned ? (
                  <span className="status-badge is-error">
                    Banned{user.ban?.banType === 'TEMPORARY' ? ` until ${new Date(user.ban.endsAt).toLocaleDateString()}` : ' (permanent)'}
                  </span>
                ) : (
                  <span className="status-badge is-success">Active</span>
                )}
              </td>
              <td>
                {user.isBanned ? (
                  <button type="button" className="btn btn-outline" onClick={() => onUnban(user)}>
                    Unban
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: '#dc2626' }}
                    onClick={(event) => onBan(user, event.currentTarget.getBoundingClientRect())}
                  >
                    Ban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
