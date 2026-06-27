const ICONS = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

export default function AlertMessage({ type = 'info', message, onDismiss }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-icon">{ICONS[type] ?? ICONS.info}</span>
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="btn-ghost" style={{ marginLeft: 'auto', padding: '0 0.4rem' }} onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
