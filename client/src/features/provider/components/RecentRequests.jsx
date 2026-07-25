import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { IconInbox } from '../../../components/common/icons.jsx';

function statusBadge(status) {
  return <span className={`provider-badge ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function RecentRequests({ requests }) {
  if (!requests?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconInbox size={26} /></div>
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
              <th>Booking ID</th>
              <th>Client</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.slice(0, 4).map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.client_name ?? '—'}</td>
                <td>{r.service_title ?? '—'}</td>
                <td>{r.service_date ? new Date(r.service_date).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
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
