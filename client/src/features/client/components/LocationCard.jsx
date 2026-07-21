import { IconMapPin } from '../../../components/common/icons.jsx';

export default function LocationCard({ label, location, onEdit }) {
  const hasLocation = location?.latitude != null;

  return (
    <div className="loc-card">
      <div className="loc-card-info">
        <div className="loc-card-label">
          <IconMapPin size={18} style={{ color: 'var(--color-primary-600)' }} />
          {label}
        </div>
        {hasLocation ? (
          <>
            <div className="loc-card-address">{location.addressText}</div>
            <div className="loc-card-coords">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</div>
          </>
        ) : (
          <div className="loc-card-empty">No location set yet.</div>
        )}
      </div>
      <button type="button" className="btn btn-outline loc-card-btn" onClick={onEdit}>
        {hasLocation ? 'Edit Location' : 'Set Location'}
      </button>

      <style>{`
        .loc-card {
          display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg);
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg); padding: var(--space-lg) var(--space-xl);
        }
        .loc-card-info { min-width: 0; }
        .loc-card-label { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--color-secondary-700); margin-bottom: 6px; }
        .loc-card-address { color: var(--color-neutral-700); font-size: var(--font-size-sm); margin-bottom: 2px; word-break: break-word; }
        .loc-card-coords { color: var(--color-neutral-400); font-size: var(--font-size-xs); font-family: monospace; }
        .loc-card-empty { color: var(--color-neutral-400); font-size: var(--font-size-sm); }
        .loc-card-btn { flex-shrink: 0; white-space: nowrap; }
        @media (max-width: 560px) {
          .loc-card { flex-direction: column; align-items: stretch; }
          .loc-card-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
