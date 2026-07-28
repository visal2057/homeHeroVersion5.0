export default function OnlineStatusControl({ isOnline, eligible, ineligibleReason, unavailableToday, onToggle, loading }) {
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
        {/* Blocked by the provider's own unavailable-date marking rather
            than an account-level issue (unverified/banned/no membership) -
            eligible stays true here, so the hint above never fires without
            this separate branch explaining what toggling on will actually do. */}
        {eligible && unavailableToday && (
          <p className="provider-form-hint" style={{ margin: '2px 0 0' }}>
            {isOnline
              ? "You're overriding your own unavailable marking just for today."
              : 'You marked today unavailable. Toggling on makes you bookable just for today.'}
          </p>
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
