import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

function statusBadge(status) {
  return <span className={`provider-badge ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function RecentRequests({ requests }) {
  if (!requests?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon">📭</div>
        <p className="provider-empty-state-title">No recent requests</p>
        <p className="provider-empty-state-desc">New booking requests will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="provider-table-wrap">
        <table className="provider-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.slice(0, 5).map((r) => (
              <tr key={r.id}>
                <td>{r.client_name ?? '—'}</td>
                <td>{r.service_title ?? '—'}</td>
                <td>{r.service_date ? new Date(r.service_date).toLocaleDateString() : '—'}</td>
                <td>{statusBadge(r.status ?? 'pending')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
        <Link to={ROUTES.PROVIDER_REQUESTS} className="btn btn-outline" style={{ fontSize: 'var(--font-size-sm)' }}>
          View All Requests →
        </Link>
      </div>
    </div>
  );
}
