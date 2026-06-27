export default function AdminMetricCard({ label, value, sub, icon, className }) {
  return (
    <div className={`stat-card-v2${className ? ` ${className}` : ''}`}>
      <div className="stat-card-v2-text">
        <span className="stat-card-v2-label">{label}</span>
        <p className="stat-card-v2-value">{value}</p>
        {sub && <p className="stat-card-v2-sub">{sub}</p>}
      </div>
      {icon && (
        <div className="stat-card-v2-icon">
          <span aria-hidden="true">{icon}</span>
        </div>
      )}
    </div>
  );
}
