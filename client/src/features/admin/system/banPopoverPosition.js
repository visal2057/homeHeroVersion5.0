const POPOVER_WIDTH = 300;
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
  let left = anchorRect.right - POPOVER_WIDTH;
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
  if (left + POPOVER_WIDTH + VIEWPORT_MARGIN > window.innerWidth) {
    left = window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN;
  }

  let top = anchorRect.bottom + 8;
  if (top + POPOVER_HEIGHT_ESTIMATE > window.innerHeight) {
    top = anchorRect.top - POPOVER_HEIGHT_ESTIMATE - 8;
    if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
  }

  return { top: top + window.scrollY, left: left + window.scrollX };
}
