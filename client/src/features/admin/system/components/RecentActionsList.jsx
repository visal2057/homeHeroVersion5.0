export default function RecentActionsList({ actions }) {
  if (!actions || actions.length === 0) {
    return <p className="empty-state">No recent activity yet.</p>;
  }

  return (
    <ul className="recent-actions-list">
      {actions.map((action) => (
        <li key={action.id} className="recent-action-item">
          <div>{action.description}</div>
          <div className="recent-action-meta">
            {action.actorName ?? 'System'} &middot; {new Date(action.createdAt).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
}
