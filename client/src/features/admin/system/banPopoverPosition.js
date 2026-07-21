const POPOVER_WIDTH = 300;
const POPOVER_HEIGHT_ESTIMATE = 300; // roomy enough to cover the optional "ends at" field
const VIEWPORT_MARGIN = 12;

/**
 * Positions the Ban popover relative to the viewport (it's portaled to
 * document.body with position: fixed, so it must anchor to the clicked
 * button's own rect rather than a page-level container -- every admin page
 * wraps its content in .animate-fade-in-up, whose final keyframe leaves a
 * `transform: translateY(0)` in place, which turns that container into the
 * containing block for any `position: fixed` descendant and is why the old
 * centered Modal appeared mid-document instead of mid-viewport).
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

  return { top, left };
}
