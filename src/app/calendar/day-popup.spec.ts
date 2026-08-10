import { IFilm } from '../filmresult';
import {
  bookmarkedFilmsOnDay,
  estimatePopupHeight,
  popupPlacement,
  POPUP_WIDTH,
} from './day-popup';

function film(over: Partial<IFilm>): IFilm {
  return {
    adult: false, genre_ids: [18], id: 1, original_language: 'en',
    original_title: '', overview: '', popularity: 0, poster_path: '',
    release_date: '1994-06-05', title: 'x', video: false,
    vote_average: 7.5, vote_count: 0, isBookmarked: true, ...over,
  };
}

describe('bookmarkedFilmsOnDay', () => {
  const films = [
    film({ id: 1, release_date: '1979-05-12', isBookmarked: true }),
    film({ id: 2, release_date: '1982-05-12', isBookmarked: true }),
    film({ id: 3, release_date: '2001-05-12', isBookmarked: false }),
    film({ id: 4, release_date: '1999-05-13', isBookmarked: true }),
    film({ id: 5, release_date: '', isBookmarked: true }),
  ];

  it('returns only bookmarked films matching the month-day, across years', () => {
    expect(bookmarkedFilmsOnDay(films, '05-12').map((f) => f.id)).toEqual([2, 1]);
  });

  it('sorts newest release year first', () => {
    const list = bookmarkedFilmsOnDay(films, '05-12');
    expect(list[0].release_date).toBe('1982-05-12');
    expect(list[1].release_date).toBe('1979-05-12');
  });

  it('returns [] when the day has films but none bookmarked', () => {
    const unbookmarked = [
      film({ id: 6, release_date: '1990-07-04', isBookmarked: false }),
      film({ id: 7, release_date: '2005-07-04', isBookmarked: undefined }),
    ];
    expect(bookmarkedFilmsOnDay(unbookmarked, '07-04')).toEqual([]);
  });

  it('returns [] for a day with no films at all', () => {
    expect(bookmarkedFilmsOnDay(films, '12-25')).toEqual([]);
  });

  it('never surfaces a film with a missing release date on a real day', () => {
    const days = ['01-01', '05-12', '07-04', '12-31'];
    const surfaced = days.flatMap((d) => bookmarkedFilmsOnDay(films, d));
    expect(surfaced.some((f) => f.id === 5)).toBe(false);
  });
});

describe('estimatePopupHeight', () => {
  it('grows with the row count', () => {
    expect(estimatePopupHeight(3, false)).toBeGreaterThan(
      estimatePopupHeight(1, false)
    );
  });

  it('adds room for the "+N more" footer', () => {
    expect(estimatePopupHeight(6, true)).toBeGreaterThan(
      estimatePopupHeight(6, false)
    );
  });
});

describe('popupPlacement', () => {
  const viewport = { width: 1200, height: 800 };
  const popup = { width: POPUP_WIDTH, height: 200 };

  it('sits to the right of the cell when there is room', () => {
    const cell = { top: 100, left: 200, right: 340, bottom: 232 };
    expect(popupPlacement(cell, viewport, popup)).toEqual({
      top: 100,
      left: 348,
    });
  });

  it('flips to the left near the right viewport edge', () => {
    const cell = { top: 100, left: 1020, right: 1160, bottom: 232 };
    expect(popupPlacement(cell, viewport, popup).left).toBe(
      1020 - 8 - POPUP_WIDTH
    );
  });

  it('clamps vertically so a bottom-row cell stays on screen', () => {
    const cell = { top: 700, left: 200, right: 340, bottom: 800 };
    expect(popupPlacement(cell, viewport, popup).top).toBe(
      800 - 200 - 8
    );
  });

  it('never places the popup off the top or left edge', () => {
    const cell = { top: -50, left: 0, right: 140, bottom: 82 };
    const tall = { width: POPUP_WIDTH, height: 900 };
    const placed = popupPlacement(cell, viewport, tall);
    expect(placed.top).toBe(8);
    expect(placed.left).toBeGreaterThanOrEqual(8);
  });
});
