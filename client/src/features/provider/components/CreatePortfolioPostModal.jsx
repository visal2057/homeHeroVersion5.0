import { useState } from 'react';
import { IconXCircle, IconAlertCircle, IconImage } from '../../../components/common/icons.jsx';

const MAX_IMAGES = 3;

export default function CreatePortfolioPostModal({ bookingId, onClose, onSave, saving }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleFilePick(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const combined = [...images, ...files].slice(0, MAX_IMAGES);
    setImages(combined);
    e.target.value = '';
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (images.length === 0) { setError('At least one image is required.'); return; }
    if (images.length > MAX_IMAGES) { setError('You can upload at most 3 images.'); return; }
    setError('');
    onSave({ bookingId, title: form.title, description: form.description, images });
  }

  return (
    <div className="provider-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="portfolio-modal-title">
      <div className="provider-modal">
        <div className="provider-modal-header">
          <h2 className="provider-modal-title" id="portfolio-modal-title">Create Post</h2>
          <button type="button" className="provider-modal-close" onClick={onClose} aria-label="Close">
            <IconXCircle size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="provider-modal-body">
            {error && (
              <div className="provider-alert error">
                <IconAlertCircle size={16} /> {error}
              </div>
            )}

            <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="provider-form-label" htmlFor="port-title">
                Post Title <span className="required">*</span>
              </label>
              <input id="port-title" name="title" className="provider-form-input" value={form.title} onChange={handleChange} required />
            </div>

            <div className="provider-form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="provider-form-label" htmlFor="port-desc">
                Post Description <span className="required">*</span>
              </label>
              <textarea id="port-desc" name="description" className="provider-form-textarea" value={form.description} onChange={handleChange} placeholder="Describe this piece of work..." required />
            </div>

            <div className="provider-form-group">
              <label className="provider-form-label" htmlFor="port-images">
                Images <span className="required">*</span>
                <span className="provider-form-hint" style={{ marginLeft: 8 }}>(up to 3, {images.length}/{MAX_IMAGES})</span>
              </label>
              <input
                id="port-images"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={handleFilePick}
                disabled={images.length >= MAX_IMAGES}
              />
              {images.length > 0 && (
                <div className="provider-portfolio-upload-preview">
                  {images.map((file, i) => (
                    <div key={i} className="provider-portfolio-upload-thumb">
                      <img src={URL.createObjectURL(file)} alt={file.name} />
                      <button type="button" onClick={() => removeImage(i)} aria-label="Remove image">
                        <IconXCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <div className="provider-portfolio-upload-empty">
                  <IconImage size={20} /> JPG or PNG, up to 3 photos
                </div>
              )}
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
