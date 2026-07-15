import { useState } from 'react';
import { getAssetUrl } from '../../../utils/storageUtils.js';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PreviousWorkGallery({ posts = [] }) {
  const [lightbox, setLightbox] = useState(null); // { postIndex, imageIndex }

  if (!posts.length) {
    return (
      <div className="pgallery-empty">
        <span>🖼️</span>
        <p>No previous work photos uploaded yet.</p>
      </div>
    );
  }

  const activeImages = lightbox ? (posts[lightbox.postIndex]?.images ?? []) : [];

  function openLightbox(postIndex, imageIndex) {
    setLightbox({ postIndex, imageIndex });
  }
  function closeLightbox() {
    setLightbox(null);
  }
  function showPrev() {
    setLightbox((lb) => (lb.imageIndex > 0 ? { ...lb, imageIndex: lb.imageIndex - 1 } : lb));
  }
  function showNext() {
    setLightbox((lb) => (lb.imageIndex < activeImages.length - 1 ? { ...lb, imageIndex: lb.imageIndex + 1 } : lb));
  }

  return (
    <div className="pwork-list">
      {posts.map((post, postIndex) => (
        <article key={post.id} className="pwork-card">
          <header className="pwork-card-header">
            <h4 className="pwork-card-title">{post.title}</h4>
            {post.createdAt && <span className="pwork-card-date">{formatDate(post.createdAt)}</span>}
          </header>
          {post.description && <p className="pwork-card-desc">{post.description}</p>}
          {post.images?.length > 0 && (
            <div className={`pwork-card-images pwork-card-images-${Math.min(post.images.length, 3)}`}>
              {post.images.map((src, imageIndex) => (
                <button
                  key={imageIndex}
                  type="button"
                  className="pwork-card-image"
                  onClick={() => openLightbox(postIndex, imageIndex)}
                  aria-label={`View image ${imageIndex + 1} of ${post.title}`}
                >
                  <img src={getAssetUrl(src)} alt={`${post.title} ${imageIndex + 1}`} />
                </button>
              ))}
            </div>
          )}
        </article>
      ))}

      {lightbox && (
        <div className="pgallery-lightbox" onClick={closeLightbox}>
          <button className="pgallery-lb-close" onClick={closeLightbox}>✕</button>
          {lightbox.imageIndex > 0 && (
            <button
              className="pgallery-lb-nav pgallery-lb-prev"
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
            >‹</button>
          )}
          <img src={getAssetUrl(activeImages[lightbox.imageIndex])} alt="" onClick={(e) => e.stopPropagation()} />
          {lightbox.imageIndex < activeImages.length - 1 && (
            <button
              className="pgallery-lb-nav pgallery-lb-next"
              onClick={(e) => { e.stopPropagation(); showNext(); }}
            >›</button>
          )}
          <div className="pgallery-lb-counter">{lightbox.imageIndex + 1} / {activeImages.length}</div>
        </div>
      )}

      <style>{`
        .pwork-list { display: flex; flex-direction: column; gap: var(--space-lg); }
        .pwork-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg); padding: var(--space-lg);
        }
        .pwork-card-header {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: var(--space-md); margin-bottom: 6px;
        }
        .pwork-card-title { margin: 0; font-size: var(--font-size-base); font-weight: 700; color: var(--color-secondary-700); }
        .pwork-card-date { font-size: var(--font-size-xs); color: var(--color-neutral-400); white-space: nowrap; }
        .pwork-card-desc { color: var(--color-neutral-600); margin: 0 0 var(--space-md); line-height: 1.6; }
        .pwork-card-images { display: grid; gap: 8px; }
        .pwork-card-images-1 { grid-template-columns: 1fr; }
        .pwork-card-images-2 { grid-template-columns: 1fr 1fr; }
        .pwork-card-images-3 { grid-template-columns: repeat(3, 1fr); }
        .pwork-card-image {
          position: relative; border: none; padding: 0; cursor: pointer;
          border-radius: var(--radius-md); overflow: hidden;
          aspect-ratio: 1; background: var(--color-neutral-100);
        }
        .pwork-card-images-1 .pwork-card-image { aspect-ratio: 16 / 9; }
        .pwork-card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
        .pwork-card-image:hover img { transform: scale(1.05); }
        .pgallery-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); }
        .pgallery-empty span { font-size: 3rem; }
        .pgallery-lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; cursor: pointer;
        }
        .pgallery-lightbox img { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: var(--radius-md); cursor: default; }
        .pgallery-lb-close {
          position: absolute; top: 24px; right: 24px; background: none; border: none;
          color: white; font-size: 1.8rem; cursor: pointer; opacity: 0.8;
          width: 43px; height: 43px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; background: rgba(255,255,255,0.1);
        }
        .pgallery-lb-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.15); border: none; color: white;
          font-size: 2.4rem; cursor: pointer; border-radius: var(--radius-sm);
          width: 53px; height: 77px; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .pgallery-lb-nav:hover { background: rgba(255,255,255,0.25); }
        .pgallery-lb-prev { left: 24px; }
        .pgallery-lb-next { right: 24px; }
        .pgallery-lb-counter { position: absolute; bottom: 20px; color: rgba(255,255,255,0.7); font-size: var(--font-size-sm); }
      `}</style>
    </div>
  );
}
