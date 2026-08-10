import { IFilm } from '../filmresult';

/** Rows shown before the popup falls back to a "+N more" footer. */
export const MAX_POPUP_ROWS = 6;
export const POPUP_WIDTH = 260;
export const POPUP_GAP = 8;
/** Viewport inset kept free so the popup never sits flush against an edge. */
export const POPUP_INSET = 8;
/** Hover dwell before the popup opens, so sweeping the grid doesn't flash it. */
export const HOVER_DELAY_MS = 120;

/* Keep these in sync with .fe-daypop in calendar.component.css — the placement
   maths runs before the popup is in the DOM, so its height is estimated. */
const HEAD_H = 34;
const ROW_H = 30;
const MORE_H = 24;
const LIST_PAD_Y = 12;

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Placement {
  top: number;
  left: number;
}

/**
 * Bookmarked films released on a given `MM-DD`, newest release year first.
 * `monthDay` is the string CalendarComponent.formatDate(day) already produces.
 */
export function bookmarkedFilmsOnDay(films: IFilm[], monthDay: string): IFilm[] {
  return films
    .filter(
      (film) =>
        film.isBookmarked && (film.release_date || '').slice(5) === monthDay
    )
    .sort(
      (a, b) =>
        Number((b.release_date || '0').slice(0, 4)) -
        Number((a.release_date || '0').slice(0, 4))
    );
}

export function estimatePopupHeight(rowCount: number, hasMore: boolean): number {
  return HEAD_H + LIST_PAD_Y + rowCount * ROW_H + (hasMore ? MORE_H : 0);
}

/**
 * Sits the popup beside the hovered cell: to its right when there is room,
 * flipped to its left otherwise, clamped so it always stays on screen.
 */
export function popupPlacement(
  cell: Rect,
  viewport: Size,
  popup: Size,
  gap: number = POPUP_GAP
): Placement {
  let left = cell.right + gap;
  if (left + popup.width > viewport.width - POPUP_INSET) {
    left = cell.left - gap - popup.width;
  }
  left = clamp(left, POPUP_INSET, viewport.width - popup.width - POPUP_INSET);

  const top = clamp(
    cell.top,
    POPUP_INSET,
    viewport.height - popup.height - POPUP_INSET
  );

  return { top, left };
}

function clamp(value: number, min: number, max: number): number {
  // A popup taller/wider than the viewport would invert the bounds; min wins.
  return Math.max(min, Math.min(value, Math.max(min, max)));
}
