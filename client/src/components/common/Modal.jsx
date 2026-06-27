export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 'var(--space-md)',
      }}
      onClick={onClose}
    >
      {/* The overlay fades in while the card itself scales up, so the
          modal feels like it is "popping" into place rather than just
          appearing instantly. */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: 'var(--space-xl)',
          animation: 'hh-scale-in var(--transition-slow) ease both',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
