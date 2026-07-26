import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatTimeRange } from '../../../utils/timeUtils.js';
import { IconClock } from '../../../components/common/icons.jsx';

// Hovering shows this as a quick, non-interactive glance (matches
// BookingDetailPreview's pointer-events:none pattern); clicking a day pins
// it open and interactive so the Remove button actually works -- closing
// only on an explicit click outside, not on stray mouse movement.
export default function DayTasksPreview({ dateLabel, jobs, isUnavailable, pinned, onRemoveUnavailable, onClose, style }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!pinned) return undefined;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) onClose?.();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pinned, onClose]);

  return createPortal(
    <div
      ref={rootRef}
      className={`provider-day-preview${pinned ? ' pinned' : ''}`}
      style={style}
    >
      <div className="provider-day-preview-title">{dateLabel}</div>

      {isUnavailable && (
        <div className="provider-day-preview-unavailable">
          <span>Marked unavailable</span>
          {pinned && (
            <button type="button" className="provider-day-preview-remove-btn" onClick={onRemoveUnavailable}>
              Remove
            </button>
          )}
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="provider-day-preview-empty">No jobs scheduled for this day.</p>
      ) : (
        <ul className="provider-day-preview-list">
          {jobs.map((j) => (
            <li key={j.id} className="provider-day-preview-job">
              <div className="provider-day-preview-job-title">{j.service_title ?? 'Service'}</div>
              <div className="provider-day-preview-job-meta">
                <IconClock size={12} /> {formatTimeRange(j.service_date, j.service_end_time)}
              </div>
              <div className="provider-day-preview-job-meta">{j.client_name ?? 'Client'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body,
  );
}
