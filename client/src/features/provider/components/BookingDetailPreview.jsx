export default function BookingDetailPreview({ booking, style }) {
  if (!booking) return null;

  return (
    <div className="provider-row-preview" style={style}>
      <div className="provider-row-preview-title">{booking.service_title ?? 'Booking Details'}</div>

      {booking.description && (
        <p className="provider-row-preview-desc">{booking.description}</p>
      )}

      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>
        {booking.service_date && <span>📅 {new Date(booking.service_date).toLocaleDateString()}</span>}
        {booking.location && (
          <span style={{ marginLeft: '8px' }}>
            📍{' '}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary-600)' }}
            >
              {booking.location}
            </a>
          </span>
        )}
      </div>

      {booking.images?.length > 0 && (
        <div className="provider-row-preview-images">
          {booking.images.slice(0, 4).map((src, i) => (
            <img key={i} src={src} alt={`Job image ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
