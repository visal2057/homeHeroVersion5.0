const STATUS_VARIANT = { RESOLVED: 'is-success', BAN_RECOMMENDED: 'is-error', CLOSED: 'is-neutral' };
const STATUS_LABEL = { RESOLVED: 'Resolved', BAN_RECOMMENDED: 'Ban Recommended', CLOSED: 'Closed' };

export default function ComplaintsHistoryTable({ complaints, onSelect }) {
  if (complaints.length === 0) {
    return <p className="empty-state">No resolved complaints yet.</p>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Complaint</th>
            <th>Sender</th>
            <th>Target</th>
            <th>Submitted</th>
            <th>Resolved</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.complaintId} onClick={() => onSelect(complaint)} style={{ cursor: 'pointer' }}>
              <td>#{complaint.complaintId}</td>
              <td>
                {complaint.complainantName}
                <br />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{complaint.complainantToken}</span>
              </td>
              <td>
                {complaint.targetName}
                <br />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{complaint.targetToken}</span>
              </td>
              <td>{new Date(complaint.submittedAt).toLocaleDateString()}</td>
              <td>{complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : '—'}</td>
              <td>
                <span className={`status-badge ${STATUS_VARIANT[complaint.status] ?? 'is-neutral'}`}>
                  {STATUS_LABEL[complaint.status] ?? complaint.status.replace('_', ' ')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
