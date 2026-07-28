import { useEffect, useState } from 'react';
import BookingDetailPreview from './BookingDetailPreview.jsx';
import { IconInbox, IconMapPin } from '../../../components/common/icons.jsx';
import { rowPreviewPosition } from '../rowPreviewPosition.js';
import { buildGoogleMapsUrl } from '../../../utils/mapsUtils.js';
import { formatTimeRange } from '../../../utils/timeUtils.js';

const MIN_ROWS = 6;
const COLUMN_COUNT = 9;

const STATUS_LABELS = {
  reschedule_pending: 'Reschedule Pending',
  reschedule_rejected: 'Rejected Reschedule',
};

function statusBadge(status) {
  const label = STATUS_LABELS[status] ?? (status.charAt(0).toUpperCase() + status.slice(1));
  return <span className={`provider-badge ${status}`}>{label}</span>;
}

export default function ProviderRequestTable({ requests, onAccept, onReject, onReschedule, loading }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });

  const hoveredBooking = requests?.find((r) => r.id === hoveredId);

  useEffect(() => {
    if (hoveredId == null) return undefined;
    function close() { setHoveredId(null); }
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [hoveredId]);

  if (!requests?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconInbox size={26} /></div>
        <p className="provider-empty-state-title">No booking requests</p>
        <p className="provider-empty-state-desc">Incoming requests will appear here.</p>
      </div>
    );
  }

  const fillerRowCount = Math.max(0, MIN_ROWS - requests.length);

  function handleMouseEnter(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredId(id);
    setPreviewPos(rowPreviewPosition(rect));
  }

  return (
    <div className="provider-table-wrap">
      <table className="provider-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Client</th>
            <th>Token</th>
            <th>Service</th>
            <th>Booking Date</th>
            <th>Booking Time</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              onMouseEnter={(e) => handleMouseEnter(e, r.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'default' }}
            >
              <td>#{r.id}</td>
              <td>{r.client_name ?? '—'}</td>
              <td>{r.client_token ?? '—'}</td>
              <td>{r.service_title ?? '—'}</td>
              <td>{r.service_date ? new Date(r.service_date).toLocaleDateString() : '—'}</td>
              <td>
                {r.service_date ? formatTimeRange(r.service_date, r.service_end_time) : '—'}
                {(r.status === 'reschedule_pending' || r.status === 'reschedule_rejected') && r.proposed_service_date && (
                  <div className="provider-proposed-time">
                    Proposed: {new Date(r.proposed_service_date).toLocaleDateString()}, {formatTimeRange(r.proposed_service_date, r.proposed_service_end_time)}
                  </div>
                )}
              </td>
              <td>
                {r.location?.latitude != null ? (
                  <a
                    href={buildGoogleMapsUrl(r.location.latitude, r.location.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconMapPin size={14} /> {r.location.addressText ?? `${r.location.latitude}, ${r.location.longitude}`}
                  </a>
                ) : '—'}
              </td>
              <td>{statusBadge(r.status ?? 'pending')}</td>
              <td>
                {r.status === 'pending' && (
                  <div className="provider-row-actions">
                    <button
                      type="button"
                      className="provider-action-btn accept"
                      disabled={loading}
                      onClick={() => onAccept(r.id)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="provider-action-btn reject"
                      disabled={loading}
                      onClick={() => onReject(r.id)}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="provider-action-btn reschedule"
                      disabled={loading}
                      onClick={() => onReschedule(r.id)}
                    >
                      Reschedule
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {Array.from({ length: fillerRowCount }).map((_, i) => (
            <tr className="provider-table-filler-row" key={`filler-${i}`}>
              <td colSpan={COLUMN_COUNT}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {hoveredId && hoveredBooking && (
        <BookingDetailPreview
          booking={hoveredBooking}
          style={{ top: previewPos.top, left: previewPos.left }}
        />
      )}
    </div>
  );
}
