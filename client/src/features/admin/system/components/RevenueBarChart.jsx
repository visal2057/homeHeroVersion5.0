const WIDTH = 560;
const HEIGHT = 260;
const PADDING = { top: 20, right: 16, bottom: 36, left: 56 };

export default function RevenueBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="empty-state">No revenue recorded yet.</p>;
  }

  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(...data.map((d) => d.totalIncome), 1);
  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.min(34, barGroupWidth * 0.55);

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxValue / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Six month revenue chart">
      {ticks.map((tick) => {
        const y = PADDING.top + chartHeight - (tick / maxValue) * chartHeight;
        return (
          <g key={tick}>
            <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} stroke="var(--color-border)" strokeDasharray="4 4" />
            <text x={PADDING.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="var(--color-text-muted)">
              {tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
            </text>
          </g>
        );
      })}

      {data.map((point, index) => {
        const x = PADDING.left + index * barGroupWidth + (barGroupWidth - barWidth) / 2;
        const barHeight = (point.totalIncome / maxValue) * chartHeight;
        const y = PADDING.top + chartHeight - barHeight;
        return (
          <g key={point.label}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx="4" fill="url(#hh-bar-gradient)" />
            <text x={x + barWidth / 2} y={HEIGHT - PADDING.bottom + 16} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">
              {point.label}
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="hh-bar-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  );
}
