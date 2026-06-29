import { useRef, useState } from 'react';
import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';
import { ImageIcon, UploadIcon } from './ContentIcons.jsx';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export default function SiteImageManager({ title, description, image, fallbackUrl, assetType, onSave, isSaving }) {
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setPendingFile(selected);
    setPendingPreviewUrl(URL.createObjectURL(selected));
  }

  function handleCancel() {
    setPendingFile(null);
    setPendingPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleConfirmSave() {
    const formData = new FormData();
    formData.append('assetType', assetType);
    formData.append('image', pendingFile);

    const succeeded = await onSave(formData);
    setIsConfirmOpen(false);
    if (succeeded) {
      handleCancel();
    }
  }

  const hasPendingChange = Boolean(pendingFile);
  const liveSrc = image ? `${API_ORIGIN}${image.url}` : fallbackUrl;
  const displaySrc = pendingPreviewUrl ?? liveSrc;

  return (
    <div className="card chart-card chart-card-interactive">
      <div className="chart-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span className="content-icon-badge">
            <ImageIcon />
          </span>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        {hasPendingChange ? (
          <span className="chart-tag content-tag-preview">Unsaved preview</span>
        ) : image ? (
          <span className="chart-tag">Live</span>
        ) : (
          <span className="chart-tag content-tag-builtin">Built-in default</span>
        )}
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>{description}</p>

      <div className="site-image-frame">
        {displaySrc ? (
          <img src={displaySrc} alt={image?.altText ?? title} />
        ) : (
          <div className="site-image-frame-empty">
            <ImageIcon />
            <span>No image uploaded yet</span>
          </div>
        )}
      </div>

      <div className="site-image-actions">
        <input
          ref={fileInputRef}
          type="file"
          id={`site-image-input-${assetType}`}
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          hidden
        />
        <label htmlFor={`site-image-input-${assetType}`} className="btn btn-outline">
          <UploadIcon /> Choose New Image
        </label>

        {hasPendingChange && (
          <>
            <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setIsConfirmOpen(true)} disabled={isSaving}>
              {isSaving && <span className="btn-spinner" aria-hidden="true" />}
              Save Changes
            </button>
          </>
        )}
      </div>

      {hasPendingChange && <p className="site-image-filename">Selected: {pendingFile.name}</p>}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Replace this image?"
        message={`This will immediately replace the ${title.toLowerCase()} shown to every visitor.`}
        confirmLabel="Confirm"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
