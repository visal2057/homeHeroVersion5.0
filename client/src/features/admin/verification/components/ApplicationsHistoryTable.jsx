const STATUS_VARIANT = { APPROVED: 'is-success', REJECTED: 'is-error' };

export default function ApplicationsHistoryTable({ applications, emptyMessage, onSelect }) {
  if (applications.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Token</th>
            <th>Categories</th>
            <th>District</th>
            <th>Applied</th>
            <th>Reviewed</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.applicationId} onClick={() => onSelect(application)} style={{ cursor: 'pointer' }}>
              <td>
                {application.fullName}
                <br />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>@{application.username}</span>
              </td>
              <td>{application.userToken}</td>
              <td>{application.categories ?? '—'}</td>
              <td>{application.districtName}</td>
              <td>{application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : '—'}</td>
              <td>{application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : '—'}</td>
              <td>
                <span className={`status-badge ${STATUS_VARIANT[application.verificationStatus] ?? 'is-neutral'}`}>
                  {application.verificationStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
