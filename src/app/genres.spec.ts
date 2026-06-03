import { IFilm } from './filmresult';
import { genreBucket, genreName, genreColor } from './genres';

function film(genre_ids: number[]): IFilm {
  return {
    adult: false, genre_ids, id: 1, original_language: 'en',
    original_title: '', overview: '', popularity: 0, poster_path: '',
    release_date: '2026-06-05', title: '', video: false,
    vote_average: 0, vote_count: 0,
  };
}

describe('genres', () => {
  it('maps a known TMDB id to its bucket name', () => {
    expect(genreBucket(film([27]))).toBe('Horror');
    expect(genreBucket(film([878]))).toBe('Sci-Fi');
    expect(genreBucket(film([35, 18]))).toBe('Comedy');
  });

  it('falls back to Drama for unknown/empty ids', () => {
    expect(genreBucket(film([]))).toBe('Drama');
    expect(genreBucket(film([999999]))).toBe('Drama');
  });

  it('exposes the bucket name via genreName', () => {
    expect(genreName(film([28]))).toBe('Action');
  });

  it('returns an oklch color, brighter in dark mode', () => {
    expect(genreColor(film([28]), false)).toBe('oklch(0.62 0.16 12)');
    expect(genreColor(film([28]), true)).toBe('oklch(0.68 0.16 12)');
  });
});
