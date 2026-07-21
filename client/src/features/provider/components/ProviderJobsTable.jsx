import { useEffect, useState } from 'react';
import BookingDetailPreview from './BookingDetailPreview.jsx';
import { IconWrench, IconMapPin } from '../../../components/common/icons.jsx';
import { rowPreviewPosition } from '../rowPreviewPosition.js';
import { buildGoogleMapsUrl } from '../../../utils/mapsUtils.js';

const MIN_ROWS = 6;
const COLUMN_COUNT = 8;

export default function ProviderJobsTable({ jobs }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });

  const hoveredBooking = jobs?.find((j) => j.id === hoveredId);

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

  if (!jobs?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconWrench size={24} /></div>
        <p className="provider-empty-state-title">No active jobs</p>
        <p className="provider-empty-state-desc">Accepted bookings waiting to be done will appear here.</p>
      </div>
    );
  }

  const fillerRowCount = Math.max(0, MIN_ROWS - jobs.length);

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
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr
              key={j.id}
              onMouseEnter={(e) => handleMouseEnter(e, j.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'default' }}
            >
              <td>#{j.id}</td>
              <td>{j.client_name ?? '—'}</td>
              <td>{j.client_token ?? '—'}</td>
              <td>{j.service_title ?? '—'}</td>
              <td>{j.service_date ? new Date(j.service_date).toLocaleDateString() : '—'}</td>
              <td>{j.service_date ? new Date(j.service_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
              <td>
                {j.location?.latitude != null ? (
                  <a
                    href={buildGoogleMapsUrl(j.location.latitude, j.location.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconMapPin size={14} /> {j.location.addressText ?? `${j.location.latitude}, ${j.location.longitude}`}
                  </a>
                ) : '—'}
              </td>
              <td>
                <span className="provider-badge active">Accepted</span>
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
