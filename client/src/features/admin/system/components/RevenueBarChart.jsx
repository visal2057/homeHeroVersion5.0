const WIDTH = 560;
const HEIGHT = 280;
const PADDING = { top: 36, right: 16, bottom: 36, left: 56 };

function formatShort(amount) {
  if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
  return String(Math.round(amount));
}

export default function RevenueBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="empty-state">No revenue recorded yet.</p>;
  }

  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(...data.map((d) => d.totalIncome), 1);
  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.min(38, barGroupWidth * 0.5);

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxValue / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Six month revenue chart">
      <rect
        x={PADDING.left - 12}
        y={PADDING.top - 12}
        width={chartWidth + 24}
        height={chartHeight + 24}
        rx="14"
        fill="var(--color-neutral-50)"
      />

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
          <g key={point.label} className="revenue-bar-group">
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--color-secondary-700)">
              {point.totalIncome > 0 ? `LKR ${formatShort(point.totalIncome)}` : '0'}
            </text>
            <rect className="revenue-bar" x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="5" fill="var(--color-secondary-700)" />
            <text x={x + barWidth / 2} y={HEIGHT - PADDING.bottom + 18} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-text-muted)">
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
