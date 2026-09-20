import { useEffect, useState } from 'react';
import { chatApi } from '../chatApi.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { SkeletonLine } from '../../../components/common/Skeleton.jsx';
import { IconXCircle, IconImage } from '../../../components/common/icons.jsx';

// Anchored under the "Job details" button in the chat thread's header (see
// ChatPage.jsx), laid on top of the message list rather than pushing it down.
export default function JobDetailsPopover({ bookingId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    chatApi.getJobDetails(bookingId)
      .then((res) => { if (!cancelled) setDetails(res.data?.data ?? null); })
      .catch(() => { if (!cancelled) setError('Could not load job details.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [bookingId]);

  return (
    <div className="jobdetails-popover" onClick={(e) => e.stopPropagation()}>
      <div className="jobdetails-popover-header">
        <span className="jobdetails-popover-title">Job Details</span>
        <button type="button" className="jobdetails-popover-close" aria-label="Close" onClick={onClose}>
          <IconXCircle size={20} />
        </button>
      </div>

      <div className="jobdetails-popover-body">
        {loading ? (
          <>
            <SkeletonLine width="90%" />
            <SkeletonLine width="70%" style={{ marginTop: 8 }} />
          </>
        ) : error ? (
          <p className="jobdetails-popover-error">{error}</p>
        ) : (
          <>
            <p className="jobdetails-popover-label">Description</p>
            <p className="jobdetails-popover-desc">{details?.jobDescription || 'No description provided.'}</p>

            <p className="jobdetails-popover-label">Photos</p>
            {details?.images?.length > 0 ? (
              <div className="jobdetails-popover-images">
                {details.images.map((path) => (
                  <a key={path} href={getAssetUrl(path)} target="_blank" rel="noopener noreferrer">
                    <img src={getAssetUrl(path)} alt="" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="jobdetails-popover-noimages">
                <IconImage size={16} /> No images attached
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        .jobdetails-popover {
          position: absolute; top: calc(100% + 8px); right: 0; z-index: 20;
          width: 320px; max-width: 85vw; max-height: 420px; overflow-y: auto;
          background: white; border-radius: var(--radius-lg);
          box-shadow: 0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid var(--color-neutral-150, #e8ecf0);
        }
        .jobdetails-popover-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-bottom: 1px solid var(--color-neutral-100);
          position: sticky; top: 0; background: white;
        }
        .jobdetails-popover-title { font-weight: 700; font-size: var(--font-size-sm); color: var(--color-secondary-700); }
        .jobdetails-popover-close { background: none; border: none; cursor: pointer; padding: 0; color: var(--color-neutral-400); display: flex; }
        .jobdetails-popover-close:hover { color: var(--color-neutral-600); }
        .jobdetails-popover-body { padding: 14px; }
        .jobdetails-popover-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-neutral-400); margin: 0 0 4px; }
        .jobdetails-popover-desc { font-size: var(--font-size-sm); color: var(--color-neutral-700); white-space: pre-wrap; margin: 0 0 14px; }
        .jobdetails-popover-error { font-size: var(--font-size-sm); color: var(--color-error, #dc2626); margin: 0; }
        .jobdetails-popover-images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .jobdetails-popover-images img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-sm); }
        .jobdetails-popover-noimages { display: flex; align-items: center; gap: 6px; font-size: var(--font-size-xs); color: var(--color-neutral-400); margin: 0; }
      `}</style>
    </div>
  );
}
