import { useState } from 'react';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export default function SiteImageManager({ title, description, image, assetType, onSave, isSaving }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleSave() {
    if (!file) return;
    const formData = new FormData();
    formData.append('assetType', assetType);
    formData.append('image', file);
    onSave(formData);
  }

  const currentSrc = preview ?? (image ? `${API_ORIGIN}${image.url}` : null);

  return (
    <div className="card chart-card">
      <h3>{title}</h3>
      <p style={{ color: 'var(--color-text-muted)' }}>{description}</p>

      {currentSrc ? (
        <img src={currentSrc} alt={image?.altText ?? title} className="site-image-preview" />
      ) : (
        <p className="empty-state">No image uploaded yet.</p>
      )}

      <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} />

      <div style={{ marginTop: 'var(--space-md)' }}>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!file || isSaving}>
          {isSaving && <span className="btn-spinner" aria-hidden="true" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
