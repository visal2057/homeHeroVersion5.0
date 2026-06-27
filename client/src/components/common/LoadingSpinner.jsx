export default function LoadingSpinner({ size = 24 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '3px solid var(--color-primary-100)',
        borderTopColor: 'var(--color-primary-600)',
        borderRadius: '50%',
        animation: 'hh-spin 0.7s linear infinite',
      }}
    >
      <style>{'@keyframes hh-spin { to { transform: rotate(360deg); } }'}</style>
    </span>
  );
}
