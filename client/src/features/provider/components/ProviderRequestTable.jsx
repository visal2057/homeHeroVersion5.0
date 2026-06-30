import { useState } from 'react';
import BookingDetailPreview from './BookingDetailPreview.jsx';
import { IconInbox, IconMapPin } from '../../../components/common/icons.jsx';

function statusBadge(status) {
  return <span className={`provider-badge ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function ProviderRequestTable({ requests, onAccept, onReject, loading }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });

  const hoveredBooking = requests?.find((r) => r.id === hoveredId);

  if (!requests?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconInbox size={26} /></div>
        <p className="provider-empty-state-title">No booking requests</p>
        <p className="provider-empty-state-desc">Incoming requests will appear here.</p>
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
              <td>{r.service_date ? new Date(r.service_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
              <td>
                {r.location ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconMapPin size={14} /> {r.location}
                  </a>
                ) : '—'}
              </td>
              <td>{statusBadge(r.status ?? 'pending')}</td>
              <td>
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                  </div>
                )}
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
