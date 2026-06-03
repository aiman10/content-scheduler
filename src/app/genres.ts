import { IFilm } from './filmresult';

export type GenreBucket =
  | 'Action' | 'Comedy' | 'Drama' | 'Romance'
  | 'Horror' | 'Sci-Fi' | 'Family' | 'Classic';

const BUCKET_HUE: Record<GenreBucket, number> = {
  Action: 12, Comedy: 50, Drama: 270, Romance: 350,
  Horror: 150, 'Sci-Fi': 220, Family: 180, Classic: 80,
};

const TMDB_TO_BUCKET: Record<number, GenreBucket> = {
  28: 'Action', 12: 'Action', 53: 'Action', 80: 'Action', 10752: 'Action',
  35: 'Comedy', 10402: 'Comedy', 10770: 'Comedy',
  18: 'Drama', 36: 'Drama', 9648: 'Drama',
  10749: 'Romance',
  27: 'Horror',
  878: 'Sci-Fi', 14: 'Sci-Fi',
  10751: 'Family', 16: 'Family',
  99: 'Classic', 37: 'Classic',
};

export function genreBucket(film: IFilm): GenreBucket {
  for (const id of film.genre_ids || []) {
    const bucket = TMDB_TO_BUCKET[id];
    if (bucket) return bucket;
  }
  return 'Drama';
}

export function genreName(film: IFilm): string {
  return genreBucket(film);
}

export function genreColor(film: IFilm, isDark: boolean): string {
  const lightness = isDark ? 0.68 : 0.62;
  return `oklch(${lightness} 0.16 ${BUCKET_HUE[genreBucket(film)]})`;
}
