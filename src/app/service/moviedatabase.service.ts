import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFilm, Result } from '../filmresult';
import { lastValueFrom } from 'rxjs';
import { Root } from '../releaseyear';

@Injectable({
  providedIn: 'root',
})
export class MoviedatabaseService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  // NOTE: TMDB key is exposed client-side by design here; it should be moved
  // behind a backend proxy (see security audit). Kept for now.
  apiKey = '4bca0ed402b50b987ea6a5a881b9fe46';

  constructor(private http: HttpClient) {}

  getFilms(date: string, page: number): Promise<Result> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('primary_release_date.gte', date)
      .set('primary_release_date.lte', date)
      .set('page', page)
      .set('language', 'en-US');
    return lastValueFrom(
      this.http.get<Result>(`${this.baseUrl}/discover/movie`, { params })
    );
  }

  searchFilm(title: string, releaseYear: number): Promise<Result> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', title)
      .set('year', releaseYear);
    return lastValueFrom(
      this.http.get<Result>(`${this.baseUrl}/search/movie`, { params })
    );
  }

  getReleaseDates(id: number): Promise<Root> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return lastValueFrom(
      this.http.get<Root>(
        `${this.baseUrl}/movie/${encodeURIComponent(id)}/release_dates`,
        { params }
      )
    );
  }
}
