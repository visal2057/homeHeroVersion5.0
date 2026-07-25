export default function ComplaintDetails({ complaint }) {
  return (
    <div className="card chart-card" style={{ marginBottom: 'var(--space-lg)' }}>
      <h3>
        Complaint #{complaint.complaintId}
        {complaint.status && <span className="status-badge is-neutral" style={{ marginLeft: 10 }}>{complaint.status}</span>}
      </h3>
      <div className="dashboard-grid" style={{ marginBottom: 0 }}>
        <div>
          <p><strong>Sender:</strong> {complaint.complainant.name} ({complaint.complainant.role})</p>
          <p><strong>Sender token:</strong> {complaint.complainant.token}</p>
        </div>
        <div>
          <p><strong>Target:</strong> {complaint.target.name} ({complaint.target.role})</p>
          <p><strong>Target token:</strong> {complaint.target.token}</p>
        </div>
      </div>
      {complaint.relatedBookingId && <p><strong>Related booking:</strong> #{complaint.relatedBookingId}</p>}
      <p><strong>Submitted:</strong> {new Date(complaint.submittedAt).toLocaleString()}</p>
      <p><strong>Details:</strong></p>
      <p>{complaint.complaintDetails}</p>
    </div>
  );
}
