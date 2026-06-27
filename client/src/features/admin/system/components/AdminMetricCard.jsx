export default function AdminMetricCard({ label, value, sub, accentColor }) {
  return (
    <div className="card stat-card" style={accentColor ? { borderLeftColor: accentColor } : undefined}>
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
      {sub && <span className="stat-card-sub">{sub}</span>}
    </div>
  );
}
