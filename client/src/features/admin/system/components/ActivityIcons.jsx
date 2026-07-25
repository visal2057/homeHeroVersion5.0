/* Purpose-built line icons for the System Admin dashboard's Recent Activity
   timeline, matching the stroke="currentColor" style already used by
   DashboardIcons.jsx and components/common/icons.jsx. These cover the
   activity types that don't already have a good match in the shared icon
   set (ban, undo, announcement, archive, verdict, invoice, generic
   fallback) so every timeline entry gets a real icon instead of an emoji. */

function Stroke({ size = 20, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconBanSlash(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.8 5.8l12.4 12.4" />
    </Stroke>
  );
}

export function IconUndo(props) {
  return (
    <Stroke {...props}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </Stroke>
  );
}

export function IconMegaphone(props) {
  return (
    <Stroke {...props}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l8 4V5L6 9H4a1 1 0 0 0-1 1Z" />
      <path d="M14 9a3 3 0 0 1 0 6" />
    </Stroke>
  );
}

export function IconArchiveBox(props) {
  return (
    <Stroke {...props}>
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </Stroke>
  );
}

export function IconScale(props) {
  return (
    <Stroke {...props}>
      <path d="M12 4v16" />
      <path d="M8 20h8" />
      <path d="M4 7h16" />
      <path d="M4 7l-2.5 5a2.5 2.5 0 0 0 5 0L4 7Z" />
      <path d="M20 7l-2.5 5a2.5 2.5 0 0 0 5 0L20 7Z" />
    </Stroke>
  );
}

export function IconReceipt(props) {
  return (
    <Stroke {...props}>
      <path d="M6 3h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3Z" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" />
    </Stroke>
  );
}

export function IconActivity(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h2l1.5 3 2-6 1.5 3h2" />
    </Stroke>
  );
}
