import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 480 }) {
  if (!isOpen) return null;

  // Portaled straight to document.body rather than rendered in place: every
  // page that opens a Modal wraps its content in .animate-fade-in-up, whose
  // final keyframe leaves `transform: translateY(0)` in place, and any
  // transform on an ancestor becomes the containing block for this div's
  // `position: fixed` -- so without the portal, the overlay centers itself
  // relative to the whole scrollable page instead of the visible viewport,
  // forcing a scroll to reach it on any page taller than one screen.
  return createPortal(
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
          maxWidth,
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 'var(--space-xl)',
          animation: 'hh-scale-in var(--transition-slow) ease both',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
