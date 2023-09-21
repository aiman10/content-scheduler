import { Injectable } from '@angular/core';
import { IFilm } from '../filmresult';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  bookmarkedMovies: IFilm[] = [];

  addBookmark(movie: IFilm) {
    this.bookmarkedMovies.push(movie);
  }

  removeBookmark(movie: IFilm) {
    const index = this.bookmarkedMovies.findIndex((m) => m.id === movie.id);
    if (index !== -1) {
      this.bookmarkedMovies.splice(index, 1);
    }
  }
}
