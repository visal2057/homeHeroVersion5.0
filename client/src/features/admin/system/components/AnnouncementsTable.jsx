const STATUS_VARIANT = { DRAFT: 'is-neutral', SCHEDULED: 'is-info', ACTIVE: 'is-success', ARCHIVED: 'is-warning' };

export default function AnnouncementsTable({ announcements, onEdit, onArchive }) {
  if (announcements.length === 0) {
    return <p className="empty-state">No announcements in this category yet.</p>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Audience</th>
            <th>Status</th>
            <th>Created</th>
            <th>Scheduled / Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((item) => (
            <tr key={item.announcementId}>
              <td>{item.title}</td>
              <td>{item.audience.replace('_', ' ')}</td>
              <td>
                <span className={`status-badge ${STATUS_VARIANT[item.status] ?? 'is-neutral'}`}>{item.status}</span>
              </td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>{item.scheduledFor ? new Date(item.scheduledFor).toLocaleString() : item.publishedAt ? new Date(item.publishedAt).toLocaleString() : '—'}</td>
              <td style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                {item.status !== 'ARCHIVED' && (
                  <>
                    <button type="button" className="btn btn-outline" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => onArchive(item)}>
                      Archive
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
