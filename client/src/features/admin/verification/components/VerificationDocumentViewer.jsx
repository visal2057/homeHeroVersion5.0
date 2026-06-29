import { useEffect, useState } from 'react';
import { fetchDocumentObjectUrl } from '../verificationAdminApi.js';

const DOC_LABELS = {
  FACE_PHOTO: 'Face Photo',
  NIC_FRONT: 'NIC Front',
  NIC_BACK: 'NIC Back',
  POLICE_REPORT: 'Police Report',
};

function DocumentThumb({ document }) {
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

  return (
    <div className="doc-thumb">
      {src && (isPdf ? (
        <a href={src} target="_blank" rel="noreferrer" style={{ display: 'block', padding: 'var(--space-lg)' }}>
          📄 View PDF
        </a>
      ) : (
        <a href={src} target="_blank" rel="noreferrer">
          <img src={src} alt={DOC_LABELS[document.documentType]} />
        </a>
      ))}
      <div className="doc-thumb-label">{DOC_LABELS[document.documentType] ?? document.documentType}</div>
    </div>
  );
}

export default function VerificationDocumentViewer({ documents }) {
  if (!documents || documents.length === 0) {
    return <p className="empty-state">No documents uploaded.</p>;
  }

  return (
    <div className="doc-grid">
      {documents.map((document) => (
        <DocumentThumb key={document.documentId} document={document} />
      ))}
    </div>
  );
}
