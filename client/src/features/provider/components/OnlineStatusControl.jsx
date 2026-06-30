export default function OnlineStatusControl({ isOnline, eligible, ineligibleReason, onToggle, loading }) {
  const disabled = loading || (!isOnline && !eligible);

  return (
    <div className="provider-status-toggle">
      <span className={`provider-status-dot ${isOnline ? 'online' : 'offline'}`} aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <span className="provider-status-label">
          {isOnline ? 'Available for Jobs' : 'Currently Offline'}
        </span>
        {!isOnline && !eligible && ineligibleReason && (
          <p className="provider-form-hint" style={{ margin: '2px 0 0' }}>{ineligibleReason}</p>
        )}
      </div>
      <label className="provider-toggle-switch" aria-label="Toggle availability">
        <input
          type="checkbox"
          checked={isOnline}
          onChange={onToggle}
          disabled={disabled}
        />
        <span className="provider-toggle-track" />
      </label>
    </div>
  );
}
