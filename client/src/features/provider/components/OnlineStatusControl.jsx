export default function OnlineStatusControl({ isOnline, onToggle, loading }) {
  return (
    <div className="provider-status-toggle">
      <span className={`provider-status-dot ${isOnline ? 'online' : 'offline'}`} aria-hidden="true" />
      <span className="provider-status-label">
        {isOnline ? 'Available for Jobs' : 'Currently Offline'}
      </span>
      <label className="provider-toggle-switch" aria-label="Toggle availability">
        <input
          type="checkbox"
          checked={isOnline}
          onChange={onToggle}
          disabled={loading}
        />
        <span className="provider-toggle-track" />
      </label>
    </div>
  );
}
