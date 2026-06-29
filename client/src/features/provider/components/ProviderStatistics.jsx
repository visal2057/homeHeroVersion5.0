export default function ProviderStatistics({ stats }) {
  const items = [
    { icon: '🔧', label: 'Total Jobs',      value: stats?.total_jobs      ?? 0, colorClass: 'green' },
    { icon: '✅', label: 'Completed',       value: stats?.completed_jobs  ?? 0, colorClass: 'blue'  },
    { icon: '⏳', label: 'Pending Requests',value: stats?.pending_requests ?? 0, colorClass: 'amber' },
    { icon: '⭐', label: 'Avg. Rating',     value: stats?.average_rating  != null
        ? Number(stats.average_rating).toFixed(1)
        : '—',                                                                   colorClass: 'teal'  },
  ];

  return (
    <div className="provider-stats-grid">
      {items.map(({ icon, label, value, colorClass }) => (
        <div key={label} className="provider-stat-card">
          <div className={`provider-stat-icon ${colorClass}`}>{icon}</div>
          <div>
            <div className="provider-stat-value">{value}</div>
            <div className="provider-stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
