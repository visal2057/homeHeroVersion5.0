import { useState } from 'react';
import { IconImage, IconCheck, IconXCircle } from '../../../components/common/icons.jsx';
import { getAssetUrl } from '../../../utils/storageUtils.js';

function EditableTile({ post, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [saving, setSaving] = useState(false);
  const cover = post.images?.[0] ? getAssetUrl(post.images[0]) : null;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(post.id, { title, description });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTitle(post.title);
    setDescription(post.description);
    setEditing(false);
  }

  return (
    <div className="glass-tile provider-portfolio-tile">
      {cover ? (
        <div className="glass-tile-bg" style={{ backgroundImage: `url(${cover})` }} role="img" aria-label={post.title} />
      ) : (
        <div className="provider-portfolio-img-placeholder" style={{ position: 'absolute', inset: 0 }}>
          <IconImage size={32} />
        </div>
      )}
      <div className="glass-tile-shade" aria-hidden="true" />
      <div className="glass-tile-content">
        {editing ? (
          <>
            <input
              className="provider-form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: 6 }}
            />
            <textarea
              className="provider-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: 60, marginBottom: 6 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="provider-action-btn accept" onClick={handleSave} disabled={saving}>
                <IconCheck size={12} /> Save
              </button>
              <button type="button" className="provider-action-btn view" onClick={handleCancel} disabled={saving}>
                <IconXCircle size={12} /> Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="provider-portfolio-title" style={{ color: 'inherit' }}>{post.title}</p>
            {post.description && <p className="provider-portfolio-desc" style={{ color: 'var(--color-primary-100)' }}>{post.description}</p>}
            <div style={{ display: 'flex', gap: 6, marginTop: 'var(--space-sm)' }}>
              <button type="button" className="provider-action-btn view" onClick={() => setEditing(true)}>Edit</button>
              <button type="button" className="provider-action-btn reject" onClick={() => onDelete(post.id)}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
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
    <div className="provider-portfolio-grid">
      {posts.map((p) => (
        <EditableTile key={p.id} post={p} onSave={onSave} onDelete={onDelete} />
      ))}
    </div>
  );
}
