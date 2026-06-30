import { useState } from 'react';
import BookingDetailPreview from './BookingDetailPreview.jsx';
import { IconWrench, IconMapPin } from '../../../components/common/icons.jsx';

export default function ProviderJobsTable({ jobs }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });

  const hoveredBooking = jobs?.find((j) => j.id === hoveredId);

  if (!jobs?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconWrench size={24} /></div>
        <p className="provider-empty-state-title">No active jobs</p>
        <p className="provider-empty-state-desc">Accepted bookings waiting to be done will appear here.</p>
      </div>
    );
  }

  function handleMouseEnter(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    const tableRect = e.currentTarget.closest('.provider-table-wrap').getBoundingClientRect();
    setHoveredId(id);
    setPreviewPos({
      top: rect.bottom - tableRect.top + 4,
      left: 0,
    });
  }

  return (
    <div className="provider-table-wrap" style={{ position: 'relative' }}>
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
                {j.location ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconMapPin size={14} /> {j.location}
                  </a>
                ) : '—'}
              </td>
              <td>
                <span className="provider-badge active">Accepted</span>
              </td>
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
