const POPOVER_WIDTH_MAX = 300; // keep in sync with admin.css's .ban-popover width
const POPOVER_HEIGHT_ESTIMATE = 300; // roomy enough to cover the optional "ends at" field
const VIEWPORT_MARGIN = 12;

/**
 * Positions the Ban popover in document coordinates (it's portaled to
 * document.body with position: absolute, not fixed, so it scrolls together
 * with the row that opened it instead of staying pinned to the viewport
 * while that row scrolls out from under it). anchorRect comes from
 * getBoundingClientRect(), which is viewport-relative, so the initial
 * above/below and left/right placement is decided against the visible
 * viewport, then the result is converted to document coordinates by adding
 * the current scroll offset.
 */
export function banPopoverPosition(anchorRect) {
  // .ban-popover's CSS width is min(300px, 100vw - 24px), so on phone-width
  // viewports the popover renders narrower than POPOVER_WIDTH_MAX -- mirror
  // that here or the clamped `left` below would assume 300px and leave the
  // popover off-center from where it actually renders.
  const popoverWidth = Math.min(POPOVER_WIDTH_MAX, window.innerWidth - VIEWPORT_MARGIN * 2);
  let left = anchorRect.right - popoverWidth;
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
  if (left + popoverWidth + VIEWPORT_MARGIN > window.innerWidth) {
    left = window.innerWidth - popoverWidth - VIEWPORT_MARGIN;
  }

  let top = anchorRect.bottom + 8;
  if (top + POPOVER_HEIGHT_ESTIMATE > window.innerHeight) {
    top = anchorRect.top - POPOVER_HEIGHT_ESTIMATE - 8;
    if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
  }

  return { top: top + window.scrollY, left: left + window.scrollX };
}
