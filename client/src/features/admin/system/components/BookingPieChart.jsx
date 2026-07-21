import { useState } from 'react';

const SIZE = 200;
const RADIUS = 78;
const BASE_STROKE = 26;
const HOVER_STROKE = 33;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Two fixed colors for the Active/Accepted vs Completed booking-status
// split, matched by statusKey so the legend stays consistent regardless of
// ordering from the API. Falls back to grey for any unexpected status.
const STATUS_COLORS = {
  active: '#3b82f6',
  completed: '#059669',
};

function colorFor(statusKey) {
  return STATUS_COLORS[String(statusKey).toLowerCase()] ?? '#94a3b8';
}

export default function BookingPieChart({ statuses }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = (statuses ?? []).reduce((sum, s) => sum + s.count, 0);

  if (!statuses || total === 0) {
    return <p className="empty-state">No bookings recorded yet.</p>;
  }

  let offsetSoFar = 0;
  const segments = statuses.map((status) => {
    const length = (status.count / total) * CIRCUMFERENCE;
    const segment = {
      label: status.label,
      value: status.count,
      percentage: status.percentage,
      color: colorFor(status.statusKey),
      length,
      offset: offsetSoFar,
    };
    offsetSoFar += length;
    return segment;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xl)', flexWrap: 'wrap', width: '100%' }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="170" height="170" role="img" aria-label="Booking distribution by status">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-neutral-100)" strokeWidth={BASE_STROKE} />
        {segments.map((segment, index) => (
          <circle
            key={segment.label}
            className="donut-segment"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={segment.color}
            strokeWidth={hoveredIndex === index ? HOVER_STROKE : BASE_STROKE}
            strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
            strokeDashoffset={-segment.offset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
          />
        ))}
        <text x={CENTER} y={CENTER - 3} textAnchor="middle">
          <tspan fontSize="26" fontWeight="800" fill="var(--color-secondary-700)">
            {total}
          </tspan>
        </text>
        <text x={CENTER} y={CENTER + 16} textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--color-text-muted)" letterSpacing="0.5">
          ACTIVE + COMPLETED
        </text>
      </svg>

      <div className="donut-legend">
        {segments.map((segment, index) => (
          <div
            key={segment.label}
            className={`donut-legend-row${hoveredIndex === index ? ' is-hovered' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
          >
            <span>
              <span className="donut-dot" style={{ backgroundColor: segment.color }} />
              {segment.label}
            </span>
            <strong>
              {segment.value} ({segment.percentage}%)
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
