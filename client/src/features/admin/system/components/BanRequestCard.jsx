export default function BanRequestCard({ request, onApply }) {
  return (
    <div className="card review-card">
      <div className="review-card-row">
        <div>
          <strong>{request.requestedUserName}</strong> <span className="status-badge is-neutral">{request.requestedUserRole}</span>
          <p className="review-card-meta">Token: {request.requestedUserToken}</p>
          <p className="review-card-meta">Complaint ID: #{request.complaintId}</p>
          <p className="review-card-meta">Recommended by: {request.requestedByName}</p>
          <p className="review-card-meta">
            {request.banType === 'PERMANENT' ? 'Permanent ban' : `Temporary ban until ${new Date(request.requestedEndsAt).toLocaleString()}`}
          </p>
          <p>{request.reason}</p>
          {request.verdictText && (
            <p className="review-card-meta">
              <strong>Verification Admin's verdict:</strong> {request.verdictText}
            </p>
          )}
        </div>
        <button type="button" className="btn" style={{ backgroundColor: '#dc2626', color: '#fff' }} onClick={() => onApply(request)}>
          Ban
        </button>
      </div>
    </div>
  );
}
