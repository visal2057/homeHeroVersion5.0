import AdminMetricCard from './AdminMetricCard.jsx';
import { IconCheckCircle, IconDollarSign, IconStar, IconCreditCard } from '../../../../components/common/icons.jsx';

function formatCurrency(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
}

const FUNNEL_ROWS = [
  { key: 'bookingsReceived', label: 'Received', color: '#0ea5e9' },
  { key: 'bookingsAccepted', label: 'Accepted', color: 'var(--color-primary-600)' },
  { key: 'bookingsRejected', label: 'Rejected', color: '#dc2626' },
];

function BookingFunnelChart({ stats }) {
  const max = Math.max(stats.bookingsReceived, 1);
  return (
    <div className="sp-funnel">
      {FUNNEL_ROWS.map((row) => {
        const value = stats[row.key];
        const width = Math.max((value / max) * 100, value > 0 ? 3 : 0);
        return (
          <div key={row.key} className="sp-funnel-row">
            <span className="sp-funnel-label">{row.label}</span>
            <div className="sp-funnel-track">
              <div className="sp-funnel-bar" style={{ width: `${width}%`, backgroundColor: row.color }} />
            </div>
            <span className="sp-funnel-value">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SPTrackingStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="sp-stats animate-fade-in-up">
      <div className="stat-grid">
        <AdminMetricCard
          label="Completed Jobs"
          value={stats.completedJobs}
          sub="Lifetime completed bookings"
          icon={<IconCheckCircle size={22} />}
        />
        <AdminMetricCard
          label="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          sub="Card payments via HomeHero"
          icon={<IconDollarSign size={22} />}
        />
        <AdminMetricCard
          label="Average Rating"
          value={stats.averageRating !== null ? stats.averageRating.toFixed(2) : '—'}
          sub={`${stats.reviewCount} review${stats.reviewCount === 1 ? '' : 's'}`}
          icon={<IconStar size={22} />}
        />
        <AdminMetricCard
          label="Memberships Bought"
          value={stats.membershipsBought}
          sub="Lifetime membership purchases"
          icon={<IconCreditCard size={22} />}
        />
      </div>

      <div className="card chart-card">
        <h3>Booking Funnel</h3>
        <BookingFunnelChart stats={stats} />
      </div>
    </div>
  );
}
