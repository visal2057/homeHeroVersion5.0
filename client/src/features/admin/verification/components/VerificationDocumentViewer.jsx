import { useEffect, useState } from 'react';
import { fetchDocumentObjectUrl } from '../verificationAdminApi.js';

const DOC_LABELS = {
  FACE_PHOTO: 'Face Photo',
  NIC_FRONT: 'NIC Front',
  NIC_BACK: 'NIC Back',
  POLICE_REPORT: 'Police Report',
};

function DocumentThumb({ document, onOpen }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl;
    fetchDocumentObjectUrl(document.documentId).then((url) => {
      objectUrl = url;
      setSrc(url);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.documentId]);

  const isPdf = document.mimeType === 'application/pdf';
  const label = DOC_LABELS[document.documentType] ?? document.documentType;

  return (
    <div className="doc-thumb">
      {src && (
        <button
          type="button"
          onClick={() => onOpen({ src, isPdf, label })}
          style={{ display: 'block', width: '100%', padding: isPdf ? 'var(--space-lg)' : 0, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {isPdf ? '📄 View PDF' : <img src={src} alt={label} />}
        </button>
      )}
      <div className="doc-thumb-label">{label}</div>
    </div>
  );
}

export default function VerificationDocumentViewer({ documents }) {
  const [viewing, setViewing] = useState(null);

  if (!documents || documents.length === 0) {
    return <p className="empty-state">No documents uploaded.</p>;
  }

  return (
    <div className="doc-grid">
      {documents.map((document) => (
        <DocumentThumb key={document.documentId} document={document} onOpen={setViewing} />
      ))}

      {viewing && (
        <div className="doc-viewer-overlay" onClick={() => setViewing(null)}>
          <div className="doc-viewer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="doc-viewer-header">
              <span>{viewing.label}</span>
              <button type="button" className="doc-viewer-close" onClick={() => setViewing(null)} aria-label="Close">✕</button>
            </div>
            <div className="doc-viewer-body">
              {viewing.isPdf ? (
                <iframe src={viewing.src} title={viewing.label} className="doc-viewer-frame" />
              ) : (
                <img src={viewing.src} alt={viewing.label} />
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .doc-viewer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: var(--space-lg);
        }
        .doc-viewer-panel {
          background: white; border-radius: var(--radius-lg);
          max-width: 90vw; max-height: 90vh; width: 720px;
          display: flex; flex-direction: column; overflow: hidden;
        }
        .doc-viewer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          border-bottom: 1px solid var(--color-neutral-200);
          font-weight: 700; color: var(--color-secondary-700);
        }
        .doc-viewer-close { background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--color-neutral-500); }
        .doc-viewer-body { flex: 1; overflow: auto; display: flex; align-items: center; justify-content: center; background: var(--color-neutral-50); }
        .doc-viewer-body img { max-width: 100%; max-height: 80vh; object-fit: contain; }
        .doc-viewer-frame { width: 100%; height: 80vh; border: none; }
      `}</style>
    </div>
  );
}
