import { Injectable } from '@angular/core';
import { IFilm } from '../filmresult';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  bookmarkedMovies: IFilm[] = [];

  constructor() {
    // Retrieve the bookmarked movies from local storage during service initialization
    this.loadBookmarkedMovies();
  }

  addBookmark(movie: IFilm) {
    this.bookmarkedMovies.push(movie);
    // Save the updated array to local storage
    this.saveBookmarkedMovies();
  }

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

  // Load the bookmarked movies array from local storage
  private loadBookmarkedMovies() {
    const savedMovies = localStorage.getItem('bookmarkedMovies');
    if (savedMovies) {
      this.bookmarkedMovies = JSON.parse(savedMovies);
    }
  }
}
