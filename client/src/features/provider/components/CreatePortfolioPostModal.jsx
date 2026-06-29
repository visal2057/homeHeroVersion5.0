import { useState } from 'react';

export default function CreatePortfolioPostModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState({ title: '', description: '', image_url: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    onSave(form);
  }

  return (
    <div className="provider-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="portfolio-modal-title">
      <div className="provider-modal">
        <div className="provider-modal-header">
          <h2 className="provider-modal-title" id="portfolio-modal-title">New Portfolio Post</h2>
          <button type="button" className="provider-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="provider-modal-body">
            {error && <div className="provider-alert error">⚠️ {error}</div>}

            <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="provider-form-label" htmlFor="port-title">
                Title <span className="required">*</span>
              </label>
              <input id="port-title" name="title" className="provider-form-input" value={form.title} onChange={handleChange} required />
            </div>

            <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="provider-form-label" htmlFor="port-desc">Description</label>
              <textarea id="port-desc" name="description" className="provider-form-textarea" value={form.description} onChange={handleChange} placeholder="Describe this piece of work..." />
            </div>

            <div className="provider-form-group">
              <label className="provider-form-label" htmlFor="port-img">Image URL</label>
              <input id="port-img" name="image_url" className="provider-form-input" value={form.image_url} onChange={handleChange} placeholder="https://..." type="url" />
            </div>
          </div>

          <div className="provider-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="btn-spinner" />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
