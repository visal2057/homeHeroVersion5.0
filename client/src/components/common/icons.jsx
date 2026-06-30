/* Small, single-color line-icon set used across the public site and the
   auth/registration flow, replacing the previous emoji glyphs with a more
   professional, brand-consistent look. Every icon inherits its color from
   `currentColor`, so it automatically matches whatever text color its
   container already sets (white on dark panels, signature green on light
   badges, etc.) with no per-usage color overrides needed. */

function Stroke({ size = 20, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props) {
  return (
    <Stroke {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20a1 1 0 0 0 1 1h4v-5a2 2 0 1 1 4 0v5h4a1 1 0 0 0 1-1v-9.5" />
    </Stroke>
  );
}

export function IconLeaf(props) {
  return (
    <Stroke {...props}>
      <path d="M5 19c-2-7 1-13 9-15 3 7 0 13-9 15Z" />
      <path d="M7 17c2-3 5-6 9-9" />
    </Stroke>
  );
}

export function IconSprout(props) {
  return (
    <Stroke {...props}>
      <path d="M12 21v-7" />
      <path d="M12 14c0-3-2-5-6-5 0 4 2 6 6 6Z" />
      <path d="M12 14c0-4 2.5-6 7-6 0 4.5-2.5 6.5-7 6Z" />
    </Stroke>
  );
}

export function IconCheckCircle(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </Stroke>
  );
}

export function IconLock(props) {
  return (
    <Stroke {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </Stroke>
  );
}

export function IconSparkle(props) {
  return (
    <Stroke {...props}>
      <path
        d="M12 3c.6 3.4 2.3 5.1 5.7 5.7-3.4.6-5.1 2.3-5.7 5.7-.6-3.4-2.3-5.1-5.7-5.7C9.7 8.1 11.4 6.4 12 3Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M19 16.5c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8Z" fill="currentColor" stroke="none" />
    </Stroke>
  );
}

export function IconPaw(props) {
  return (
    <Stroke {...props}>
      <circle cx="7" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.3" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path d="M8 15.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5-1.8 3.5-4 3.5-4-1.5-4-3.5Z" />
    </Stroke>
  );
}

export function IconHardHat(props) {
  return (
    <Stroke {...props}>
      <path d="M12 3a5 5 0 0 1 5 5v1H7V8a5 5 0 0 1 5-5Z" />
      <path d="M11 4.3v1" />
      <path d="M4.5 9h15" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </Stroke>
  );
}

export function IconWrench(props) {
  return (
    <Stroke {...props}>
      <path d="M14.5 7.5a3 3 0 1 1-4.2 4.2L5 17l2 2 5.3-5.3a3 3 0 0 0 4.2-4.2l-1.5 1.5-1.8-.4-.4-1.8Z" fill="currentColor" stroke="none" />
    </Stroke>
  );
}

export function IconSnowflake(props) {
  return (
    <Stroke {...props}>
      <path d="M12 2v20" />
      <path d="M3.8 7l16.4 10" />
      <path d="M20.2 7 3.8 17" />
      <path d="M9 4.5l3 1.8 3-1.8M9 19.5l3-1.8 3 1.8" />
    </Stroke>
  );
}

export function IconClipboardList(props) {
  return (
    <Stroke {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 10h6M9 13h6M9 16h4" />
    </Stroke>
  );
}

export function IconUserCheck(props) {
  return (
    <Stroke {...props}>
      <circle cx="9" cy="7.5" r="3" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <path d="M16 13.5l1.6 1.6L21 11.5" />
    </Stroke>
  );
}

export function IconStar(props) {
  return (
    <Stroke {...props}>
      <path
        d="M12 3l2.6 5.6 6.2.6-4.6 4.2 1.3 6.1L12 16.8 6.5 19.5l1.3-6.1L3.2 9.2l6.2-.6Z"
        fill="currentColor"
        stroke="none"
      />
    </Stroke>
  );
}

export function IconToolbox(props) {
  return (
    <Stroke {...props}>
      <rect x="3" y="9" width="18" height="11" rx="2" />
      <path d="M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
      <path d="M3 14h18" />
      <path d="M10 14v1.5M14 14v1.5" />
    </Stroke>
  );
}

export function IconMail(props) {
  return (
    <Stroke {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 6.5l8 6.5 8-6.5" />
    </Stroke>
  );
}

export function IconImage(props) {
  return (
    <Stroke {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M21 17l-5.5-5.5-4 4-2-2-5.5 5.5" />
    </Stroke>
  );
}

export function IconClock(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Stroke>
  );
}

export function IconDocumentEdit(props) {
  return (
    <Stroke {...props}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 17l.5-2 4-4 2 2-4 4Z" />
    </Stroke>
  );
}

export function IconRocket(props) {
  return (
    <Stroke {...props}>
      <path d="M12 2c3 1 5 4 5 8 0 3-1.5 5.5-3 7l-2 2-2-2c-1.5-1.5-3-4-3-7 0-4 2-7 5-8Z" />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <path d="M9 16l-3 3 1-4M15 16l3 3-1-4" />
    </Stroke>
  );
}

export function IconChatBubble(props) {
  return (
    <Stroke {...props}>
      <path d="M4 5h16v11H9l-4 4v-4H4Z" />
      <path d="M8 9h8M8 12h5" />
    </Stroke>
  );
}

export function IconPhone(props) {
  return (
    <Stroke {...props}>
      <path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2C10.5 20 4 13.5 4 5a2 2 0 0 1 2-2Z" fill="currentColor" stroke="none" />
    </Stroke>
  );
}

export function IconMapPin(props) {
  return (
    <Stroke {...props}>
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
      <circle cx="12" cy="9" r="2.4" />
    </Stroke>
  );
}

export function IconShield(props) {
  return (
    <Stroke {...props}>
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6Z" />
      <path d="M9 12l2 2 4-4" />
    </Stroke>
  );
}

export function IconEye(props) {
  return (
    <Stroke {...props}>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Stroke>
  );
}

export function IconEyeOff(props) {
  return (
    <Stroke {...props}>
      <path d="M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a13.6 13.6 0 0 1-3.1 3.9M6.2 6.2C4 7.8 2 12 2 12s2.4 4.4 6.2 6.1M9.9 14.1a3 3 0 0 0 4.2-4.2" />
      <path d="M3 3l18 18" />
    </Stroke>
  );
}

export function IconUser(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </Stroke>
  );
}

export function IconLogOut(props) {
  return (
    <Stroke {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Stroke>
  );
}

export function IconFlag(props) {
  return (
    <Stroke {...props}>
      <path d="M4 21V4" />
      <path d="M4 4h12l-2.5 5L16 14H4V4Z" />
    </Stroke>
  );
}

export function IconChevronDown(props) {
  return (
    <Stroke {...props}>
      <path d="M6 9l6 6 6-6" />
    </Stroke>
  );
}

export function IconCalendar(props) {
  return (
    <Stroke {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v3M16 2v3" />
      <path d="M3 10h18" />
    </Stroke>
  );
}

export function IconBell(props) {
  return (
    <Stroke {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 4.5-2 6-2 6h16s-2-1.5-2-6Z" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Stroke>
  );
}

export function IconSend(props) {
  return (
    <Stroke {...props}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9l20-7Z" />
    </Stroke>
  );
}

export function IconSearch(props) {
  return (
    <Stroke {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </Stroke>
  );
}

export function IconDollarSign(props) {
  return (
    <Stroke {...props}>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Stroke>
  );
}

export function IconTrophy(props) {
  return (
    <Stroke {...props}>
      <path d="M6 9H3V4h3" />
      <path d="M18 9h3V4h-3" />
      <path d="M6 4h12v7a6 6 0 0 1-12 0V4Z" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </Stroke>
  );
}

export function IconAlertCircle(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </Stroke>
  );
}

export function IconCheck(props) {
  return (
    <Stroke {...props}>
      <path d="M5 12l5 5L20 7" />
    </Stroke>
  );
}

export function IconXCircle(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </Stroke>
  );
}

export function IconInbox(props) {
  return (
    <Stroke {...props}>
      <path d="M4 15h16l-2-9H6L4 15Z" />
      <path d="M4 15a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4" />
      <path d="M9 15v-2h6v2" />
    </Stroke>
  );
}

export function IconCreditCard(props) {
  return (
    <Stroke {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Stroke>
  );
}
