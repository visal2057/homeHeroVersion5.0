import { IconWrench, IconCheckCircle, IconStar, IconDollarSign } from '../../../components/common/icons.jsx';
import { formatLKR } from '../../payments/client/paymentMath.js';

export default function ProviderStatistics({ stats, totalEarnings }) {
  const items = [
    { Icon: IconWrench,      label: 'Total Jobs',       value: stats?.total_jobs      ?? 0, colorClass: 'green' },
    { Icon: IconCheckCircle, label: 'Completed',        value: stats?.completed_jobs  ?? 0, colorClass: 'blue'  },
    { Icon: IconStar,        label: 'Avg. Rating',      value: stats?.average_rating  != null
        ? Number(stats.average_rating).toFixed(1)
        : '—',                                                                              colorClass: 'teal'  },
    { Icon: IconDollarSign,  label: 'Total Earnings via HomeHero', value: totalEarnings != null
        ? formatLKR(totalEarnings)
        : '—',                                                                              colorClass: 'purple', wide: true },
  ];

  return (
    <div className="provider-stats-grid">
      {items.map(({ Icon, label, value, colorClass, wide }) => (
        <div key={label} className={`provider-stat-card-v2${wide ? ' provider-stat-card-v2-wide' : ''}`}>
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
