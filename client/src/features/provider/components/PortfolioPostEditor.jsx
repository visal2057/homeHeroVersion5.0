import { useState } from 'react';
import { IconImage, IconCheck, IconXCircle } from '../../../components/common/icons.jsx';
import { getAssetUrl } from '../../../utils/storageUtils.js';

const MAX_IMAGES = 3;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

function PostCard({ post, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [newImages, setNewImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);

  function handlePickImages(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const combined = [...newImages, ...files].slice(0, MAX_IMAGES);
    setNewImages(combined);
    setImageError('');
    e.target.value = '';
  }

  function removeNewImage(index) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (newImages.length > MAX_IMAGES) {
      setImageError('You can upload at most 3 images.');
      return;
    }
    setSaving(true);
    try {
      await onSave(post.id, { title, description, images: newImages });
      setNewImages([]);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTitle(post.title);
    setDescription(post.description);
    setNewImages([]);
    setImageError('');
    setEditing(false);
  }

  return (
    <article className="pp-post-card">
      {editing ? (
        <div className="pp-post-edit">
          <input
            className="provider-form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <textarea
            className="provider-form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ minHeight: 70, marginBottom: 10 }}
          />

          <label className="provider-form-label" style={{ display: 'block', marginBottom: 4 }}>
            Replace Images
            <span className="provider-form-hint" style={{ marginLeft: 8 }}>
              (optional, up to 3 — leave empty to keep the current photos)
            </span>
          </label>
          {imageError && <p style={{ margin: '0 0 8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>{imageError}</p>}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            onChange={handlePickImages}
            disabled={newImages.length >= MAX_IMAGES}
            style={{ marginBottom: 8 }}
          />
          {newImages.length > 0 && (
            <div className="pp-post-images pp-post-images-3" style={{ marginBottom: 10 }}>
              {newImages.map((file, i) => (
                <div key={i} className="pp-post-image" style={{ position: 'relative' }}>
                  <img src={URL.createObjectURL(file)} alt={file.name} />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    aria-label="Remove image"
                    className="pp-post-image-remove"
                  >
                    <IconXCircle size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="provider-action-btn accept" onClick={handleSave} disabled={saving}>
              <IconCheck size={12} /> Save
            </button>
            <button type="button" className="provider-action-btn view" onClick={handleCancel} disabled={saving}>
              <IconXCircle size={12} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="pp-post-header">
            <h4 className="pp-post-title">{post.title}</h4>
            {post.createdAt && <span className="pp-post-date">{formatDate(post.createdAt)}</span>}
          </header>
          {post.categoryName && <span className="pp-post-category">{post.categoryName}</span>}
          {post.description && <p className="pp-post-desc">{post.description}</p>}
          {post.images?.length > 0 && (
            <div className={`pp-post-images pp-post-images-${Math.min(post.images.length, 3)}`}>
              {post.images.map((src, i) => (
                <div key={i} className="pp-post-image">
                  <img src={getAssetUrl(src)} alt={`${post.title} ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
          <div className="pp-post-actions">
            <button type="button" className="provider-action-btn view" onClick={() => setEditing(true)}>Edit</button>
            <button type="button" className="provider-action-btn reject" onClick={() => onDelete(post.id)}>Delete</button>
          </div>
        </>
      )}
    </article>
  );
}

/* Displays the provider's portfolio posts (Previous Works) — posts originate only from
   the Create Post action on a completed booking; this view supports edit and delete. */
export default function PortfolioPostEditor({ posts, onSave, onDelete }) {
  if (!posts?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconImage size={24} /></div>
        <p className="provider-empty-state-title">No portfolio posts yet</p>
        <p className="provider-empty-state-desc">Create a post from a completed job on the Completed Jobs page to showcase your work here.</p>
      </div>
    );
  }

  return (
    <div className="pp-post-list">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} onSave={onSave} onDelete={onDelete} />
      ))}

      <style>{`
        .pp-post-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-lg);
          align-items: start;
        }
        .pp-post-card {
          background: var(--color-neutral-0); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: var(--space-lg);
        }
        .pp-post-header {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: var(--space-md); margin-bottom: 6px;
        }
        .pp-post-title { margin: 0; font-size: var(--font-size-base); font-weight: 700; color: var(--color-secondary-700); }
        .pp-post-date { font-size: var(--font-size-xs); color: var(--color-text-muted); white-space: nowrap; }
        .pp-post-category {
          display: inline-block; margin-bottom: 8px; padding: 2px 10px;
          background: var(--color-primary-50); color: var(--color-primary-700);
          border-radius: var(--radius-full, 999px); font-size: var(--font-size-xs); font-weight: 600;
        }
        .pp-post-desc { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 0 0 var(--space-md); line-height: 1.6; }
        .pp-post-images { display: grid; gap: 8px; margin-bottom: var(--space-md); }
        .pp-post-images-1 { grid-template-columns: 1fr; }
        .pp-post-images-2 { grid-template-columns: 1fr 1fr; }
        .pp-post-images-3 { grid-template-columns: repeat(3, 1fr); }
        .pp-post-image { border-radius: var(--radius-md); overflow: hidden; aspect-ratio: 1; background: var(--color-neutral-100); }
        .pp-post-images-1 .pp-post-image { aspect-ratio: 16 / 9; }
        .pp-post-image img { width: 100%; height: 100%; object-fit: cover; }
        .pp-post-image-remove {
          position: absolute; top: 4px; right: 4px; width: 20px; height: 20px;
          border-radius: 50%; border: none; background: rgba(0,0,0,0.6); color: white;
          display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
        }
        .pp-post-actions { display: flex; gap: 6px; }
      `}</style>
    </div>
  );
}
