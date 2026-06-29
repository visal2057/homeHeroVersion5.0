import { useState } from 'react';

export default function PreviousWorkGallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null);

  if (!images.length) {
    return (
      <div className="pgallery-empty">
        <span>🖼️</span>
        <p>No previous work photos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pgallery-grid">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            className="pgallery-item"
            onClick={() => setLightbox(i)}
            aria-label={`View image ${i + 1}`}
          >
            <img src={src} alt={`Work ${i + 1}`} />
            <div className="pgallery-overlay">🔍</div>
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="pgallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="pgallery-lb-close" onClick={() => setLightbox(null)}>✕</button>
          {lightbox > 0 && (
            <button
              className="pgallery-lb-nav pgallery-lb-prev"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >‹</button>
          )}
          <img src={images[lightbox]} alt="" onClick={(e) => e.stopPropagation()} />
          {lightbox < images.length - 1 && (
            <button
              className="pgallery-lb-nav pgallery-lb-next"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >›</button>
          )}
          <div className="pgallery-lb-counter">{lightbox + 1} / {images.length}</div>
        </div>
      )}

      <style>{`
        .pgallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-md);
        }
        .pgallery-item {
          position: relative; border: none; padding: 0; cursor: pointer;
          border-radius: var(--radius-md); overflow: hidden;
          aspect-ratio: 1; background: var(--color-neutral-100);
        }
        .pgallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
        .pgallery-item:hover img { transform: scale(1.05); }
        .pgallery-overlay {
          position: absolute; inset: 0; background: rgba(6,78,59,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; opacity: 0; transition: opacity 0.2s;
        }
        .pgallery-item:hover .pgallery-overlay { opacity: 1; }
        .pgallery-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); }
        .pgallery-empty span { font-size: 2.5rem; }
        .pgallery-lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; cursor: pointer;
        }
        .pgallery-lightbox img { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: var(--radius-md); cursor: default; }
        .pgallery-lb-close {
          position: absolute; top: 20px; right: 20px; background: none; border: none;
          color: white; font-size: 1.5rem; cursor: pointer; opacity: 0.8;
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; background: rgba(255,255,255,0.1);
        }
        .pgallery-lb-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.15); border: none; color: white;
          font-size: 2rem; cursor: pointer; border-radius: var(--radius-sm);
          width: 44px; height: 64px; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .pgallery-lb-nav:hover { background: rgba(255,255,255,0.25); }
        .pgallery-lb-prev { left: 20px; }
        .pgallery-lb-next { right: 20px; }
        .pgallery-lb-counter { position: absolute; bottom: 20px; color: rgba(255,255,255,0.7); font-size: var(--font-size-sm); }
      `}</style>
    </div>
  );
}
