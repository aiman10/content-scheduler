import { IFilm } from '../filmresult';
import { genreBucket, GenreBucket } from '../genres';

export interface CalendarFilters {
  genre: GenreBucket | null; // null = All
  minRating: number;         // 0 = All
  decade: number | null;     // e.g. 1990; null = All
  bookmarkedOnly: boolean;
}

export const DEFAULT_FILTERS: CalendarFilters = {
  genre: null,
  minRating: 0,
  decade: null,
  bookmarkedOnly: false,
};

export function applyFilters(films: IFilm[], f: CalendarFilters): IFilm[] {
  return films.filter((film) => {
    if (f.genre && genreBucket(film) !== f.genre) return false;
    if (f.minRating && (film.vote_average || 0) < f.minRating) return false;
    if (f.decade != null) {
      const year = Number((film.release_date || '0').slice(0, 4));
      if (Math.floor(year / 10) * 10 !== f.decade) return false;
    }
    if (f.bookmarkedOnly && !film.isBookmarked) return false;
    return true;
  });
}
