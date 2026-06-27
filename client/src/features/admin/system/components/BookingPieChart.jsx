const SIZE = 200;
const RADIUS = 80;
const CENTER = SIZE / 2;

function describeArc(startAngle, endAngle) {
  const start = {
    x: CENTER + RADIUS * Math.cos(startAngle),
    y: CENTER + RADIUS * Math.sin(startAngle),
  };
  const end = {
    x: CENTER + RADIUS * Math.cos(endAngle),
    y: CENTER + RADIUS * Math.sin(endAngle),
  };
  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

export default function BookingPieChart({ active, completed }) {
  const total = active + completed;

  if (total === 0) {
    return <p className="empty-state">No bookings recorded yet.</p>;
  }

  const activeAngle = (active / total) * Math.PI * 2;
  const startAngle = -Math.PI / 2;

  const slices = [
    { label: 'Active / Accepted', value: active, color: '#10b981', path: describeArc(startAngle, startAngle + activeAngle) },
    { label: 'Completed', value: completed, color: '#0f5132', path: describeArc(startAngle + activeAngle, startAngle + Math.PI * 2) },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="180" height="180" role="img" aria-label="Booking distribution chart">
        {slices.map((slice) => (
          <path key={slice.label} d={slice.path} fill={slice.color} stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {slices.map((slice) => (
          <div key={slice.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: slice.color, display: 'inline-block' }} />
            <span style={{ fontSize: 'var(--font-size-sm)' }}>
              {slice.label}: <strong>{slice.value}</strong> ({Math.round((slice.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
