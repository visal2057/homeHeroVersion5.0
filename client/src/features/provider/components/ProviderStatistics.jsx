import { IconWrench, IconCheckCircle, IconClock, IconStar } from '../../../components/common/icons.jsx';

export default function ProviderStatistics({ stats }) {
  const items = [
    { Icon: IconWrench,      label: 'Total Jobs',       value: stats?.total_jobs      ?? 0, colorClass: 'green' },
    { Icon: IconCheckCircle, label: 'Completed',        value: stats?.completed_jobs  ?? 0, colorClass: 'blue'  },
    { Icon: IconClock,       label: 'Pending Requests', value: stats?.pending_requests ?? 0, colorClass: 'amber' },
    { Icon: IconStar,        label: 'Avg. Rating',      value: stats?.average_rating  != null
        ? Number(stats.average_rating).toFixed(1)
        : '—',                                                                              colorClass: 'teal'  },
  ];

  return (
    <div className="provider-stats-grid">
      {items.map(({ Icon, label, value, colorClass }) => (
        <div key={label} className="provider-stat-card-v2">
          <div className="provider-stat-card-v2-text">
            <span className="provider-stat-card-v2-label">{label}</span>
            <p className="provider-stat-card-v2-value">{value}</p>
          </div>
          <div className={`provider-stat-card-v2-icon ${colorClass}`}>
            <Icon size={22} />
          </div>
        </div>
      ))}
    </div>
  );
}
