// Shimmer skeleton primitives - shape-matched placeholders for the app's
// loading states, replacing the single generic spinner every page used to
// show regardless of what was actually loading underneath it.

export function SkeletonLine({ width = '100%', height = 14, style }) {
  return <span className="hh-skeleton" style={{ width, height, display: 'block', ...style }} />;
}

export function SkeletonCircle({ size = 40, style }) {
  return <span className="hh-skeleton hh-skeleton-circle" style={{ width: size, height: size, ...style }} />;
}

// Mirrors a booking/complaint table row: an avatar-ish circle, two text
// lines, and a status pill off to the side.
export function SkeletonRow() {
  return (
    <div className="hh-skeleton-row">
      <SkeletonCircle size={36} />
      <div className="hh-skeleton-row-lines">
        <SkeletonLine width="55%" height={13} />
        <SkeletonLine width="35%" height={11} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine width={72} height={24} style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
    </div>
  );
}

export function SkeletonRows({ count = 4 }) {
  return (
    <div className="hh-skeleton-rows">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

// Mirrors a provider/service card: an image block, a title line, a
// shorter description line, and a footer line.
export function SkeletonCard() {
  return (
    <div className="hh-skeleton-card">
      <span className="hh-skeleton hh-skeleton-card-media" />
      <div className="hh-skeleton-card-body">
        <SkeletonLine width="70%" height={16} />
        <SkeletonLine width="90%" height={12} style={{ marginTop: 10 }} />
        <SkeletonLine width="40%" height={12} style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="hh-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
