import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Result } from '../filmresult';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MoviedatabaseService {
  apiKey = '4bca0ed402b50b987ea6a5a881b9fe46';

  constructor(private http: HttpClient) {}

  getFilms(date: string, page: number): Promise<Result> {
    return lastValueFrom(
      this.http.get<Result>(
        `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiKey}&primary_release_date.gte=${date}&primary_release_date.lte=${date}&page=${page}&language=en-US`
      )
    );
  }
  searchFilm(title: string, releaseYear: number): Promise<Result> {
    return lastValueFrom(
      this.http.get<Result>(
        `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${title}&year&=${releaseYear}`
      )
    );
  }
}
