export default function ProviderJobsTable({ jobs }) {
  if (!jobs?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon">🔧</div>
        <p className="provider-empty-state-title">No active jobs</p>
        <p className="provider-empty-state-desc">Accepted bookings waiting to be done will appear here.</p>
      </div>
    );
  }

  return (
    <div className="provider-table-wrap">
      <table className="provider-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Service Date</th>
            <th>Location</th>
            <th>Contact</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id}>
              <td>{j.client_name ?? '—'}</td>
              <td>{j.service_title ?? '—'}</td>
              <td>{j.service_date ? new Date(j.service_date).toLocaleDateString() : '—'}</td>
              <td>
                {j.location ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary-600)' }}
                  >
                    📍 {j.location}
                  </a>
                ) : '—'}
              </td>
              <td>{j.client_phone ?? j.client_email ?? '—'}</td>
              <td>
                <span className="provider-badge active">Accepted</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
