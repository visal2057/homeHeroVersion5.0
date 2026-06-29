export default function ProviderWorkPreview({ images = [], providerName }) {
  if (!images.length) return null;

  return (
    <div className="pwp-wrap">
      <div className="pwp-title">Recent Work by {providerName}</div>
      <div className="pwp-grid">
        {images.slice(0, 4).map((src, i) => (
          <div key={i} className="pwp-item">
            <img src={src} alt={`Work ${i + 1}`} />
          </div>
        ))}
      </div>
      <style>{`
        .pwp-wrap { background: var(--color-primary-50); border-radius: var(--radius-md); padding: var(--space-md); }
        .pwp-title { font-weight: 600; font-size: var(--font-size-sm); color: var(--color-secondary-700); margin-bottom: 8px; }
        .pwp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
        .pwp-item { aspect-ratio: 1; overflow: hidden; border-radius: var(--radius-sm); }
        .pwp-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
        .pwp-item:hover img { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
