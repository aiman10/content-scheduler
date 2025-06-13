import { Injectable } from '@angular/core';
import { IFilm } from '../filmresult';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  bookmarkedMovies: IFilm[] = [];

  constructor(private http: HttpClient) {}

  addBookmark(movie: IFilm) {}

  removeBookmark(movie: IFilm) {
    const index = this.bookmarkedMovies.findIndex((m) => m.id === movie.id);
    if (index !== -1) {
      this.bookmarkedMovies.splice(index, 1);
      // Save the updated array to local storage
      this.saveBookmarkedMovies();
    }
  }

  // Save the bookmarked movies array to local storage
  private saveBookmarkedMovies() {
    localStorage.setItem(
      'bookmarkedMovies',
      JSON.stringify(this.bookmarkedMovies)
    );
  }

  // Load the bookmarked movies array from the JSON file
  private loadBookmarkedMovies(): Observable<IFilm[]> {
    return this.http.get<IFilm[]>('assets/popular_movies.json').pipe(
      tap((movies) => {
        this.bookmarkedMovies = movies;
        this.saveBookmarkedMovies();
      })
    );
  }
}
