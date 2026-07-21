const PREVIEW_WIDTH = 340;
const PREVIEW_HEIGHT_ESTIMATE = 240;
const VIEWPORT_MARGIN = 12;

/**
 * Positions the row hover-preview relative to the viewport (it's portaled to
 * document.body with position: fixed, so it must never anchor to a scrollable
 * ancestor like the table wrap — that's what caused the old clipped popup).
 */
export function rowPreviewPosition(rowRect) {
  let left = rowRect.left;
  if (left + PREVIEW_WIDTH + VIEWPORT_MARGIN > window.innerWidth) {
    left = window.innerWidth - PREVIEW_WIDTH - VIEWPORT_MARGIN;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  let top = rowRect.bottom + 6;
  if (top + PREVIEW_HEIGHT_ESTIMATE > window.innerHeight) {
    top = rowRect.top - PREVIEW_HEIGHT_ESTIMATE - 6;
    if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
  }

  return { top, left };
}
