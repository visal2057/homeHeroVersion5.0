import { motion, useReducedMotion } from 'motion/react';
import { IconAlertCircle } from './icons.jsx';

// Shared "nothing to show" / "something went wrong" panel. Used both for
// genuine empty results and for real API-failure states, so a broken
// backend call is never mistaken for a working page with no data. The icon
// gets a small entrance pop so an empty page still feels alive rather than
// static and dead.
export default function EmptyState({ icon: Icon = IconAlertCircle, title, message, actionLabel, onAction, tone = 'neutral' }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="hh-empty-state" role={tone === 'error' ? 'alert' : undefined}>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Icon size={48} className={`hh-empty-state-icon${tone === 'error' ? ' hh-empty-state-icon-error' : ''}`} />
      </motion.div>
      {title && <h3 className="hh-empty-state-title">{title}</h3>}
      {message && <p className="hh-empty-state-message">{message}</p>}
      {onAction && (
        <button type="button" className="btn btn-outline" onClick={onAction} style={{ marginTop: 'var(--space-md)' }}>
          {actionLabel ?? 'Try Again'}
        </button>
      )}
      <style>{`
        .hh-empty-state { text-align: center; padding: var(--space-2xl) var(--space-md); color: var(--color-neutral-400); display: flex; flex-direction: column; align-items: center; }
        .hh-empty-state-icon { color: var(--color-neutral-300); margin-bottom: var(--space-md); }
        .hh-empty-state-icon-error { color: var(--color-error, #dc2626); }
        .hh-empty-state-title { color: var(--color-neutral-600); margin-bottom: 8px; }
        .hh-empty-state-message { margin: 0; }
      `}</style>
    </div>
  );
}
