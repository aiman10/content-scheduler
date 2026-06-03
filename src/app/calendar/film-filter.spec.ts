import { IFilm } from '../filmresult';
import { applyFilters, DEFAULT_FILTERS, CalendarFilters } from './film-filter';

function film(over: Partial<IFilm>): IFilm {
  return {
    adult: false, genre_ids: [18], id: 1, original_language: 'en',
    original_title: '', overview: '', popularity: 0, poster_path: '',
    release_date: '1994-06-05', title: 'x', video: false,
    vote_average: 7.5, vote_count: 0, isBookmarked: true, ...over,
  };
}

describe('applyFilters', () => {
  const films = [
    film({ id: 1, genre_ids: [27], vote_average: 6.0, release_date: '1980-06-01', isBookmarked: true }),
    film({ id: 2, genre_ids: [878], vote_average: 8.2, release_date: '1999-06-02', isBookmarked: false }),
    film({ id: 3, genre_ids: [35], vote_average: 7.1, release_date: '2010-06-03', isBookmarked: true }),
  ];

  it('returns everything with default filters', () => {
    expect(applyFilters(films, DEFAULT_FILTERS).length).toBe(3);
  });

  it('filters by genre bucket', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, genre: 'Sci-Fi' };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([2]);
  });

  it('filters by minimum rating', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, minRating: 7 };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([2, 3]);
  });

  it('filters by decade', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, decade: 1990 };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([2]);
  });

  it('filters bookmarked only', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, bookmarkedOnly: true };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([1, 3]);
  });
});
