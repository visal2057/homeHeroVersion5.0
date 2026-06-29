export default function CompletedJobsTable({ jobs }) {
  if (!jobs?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon">✅</div>
        <p className="provider-empty-state-title">No completed jobs yet</p>
        <p className="provider-empty-state-desc">Finished jobs will appear here after they are marked complete.</p>
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
            <th>Completed On</th>
            <th>Rating</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id}>
              <td>{j.client_name ?? '—'}</td>
              <td>{j.service_title ?? '—'}</td>
              <td>{j.completed_at ? new Date(j.completed_at).toLocaleDateString() : '—'}</td>
              <td>
                {j.rating != null
                  ? <span style={{ color: '#fbbf24' }}>{'★'.repeat(j.rating)}{'☆'.repeat(5 - j.rating)}</span>
                  : <span style={{ color: 'var(--color-text-muted)' }}>Not rated</span>
                }
              </td>
              <td style={{ maxWidth: 220, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {j.review_text ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
