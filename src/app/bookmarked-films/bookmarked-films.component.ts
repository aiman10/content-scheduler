import { Component, OnInit } from '@angular/core';
import { IFilm } from '../filmresult';
import { ActivatedRoute } from '@angular/router';
import { BookmarkService } from '../service/bookmarked.service';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { SelectdateService } from '../service/selectdate.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bookmarked-films',
  templateUrl: './bookmarked-films.component.html',
  styleUrls: ['./bookmarked-films.component.css'],
})
export class BookmarkedFilmsComponent implements OnInit {
  bookmarkedMovies: IFilm[] = [];

  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService,
    private bookmarkService: BookmarkService,
    private dateService: SelectdateService
  ) {}

  //TODO Add export/import localstorage/bookmarked movies to file
  ngOnInit(): void {
    this.bookmarkedMovies = this.bookmarkService.bookmarkedMovies;
    this.sortBookmarkedMoviesByDate();
  }

  sortBookmarkedMoviesByDate() {
    this.bookmarkedMovies.sort((a, b) => {
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);

      // Compare years
      const yearDifference = dateA.getFullYear() - dateB.getFullYear();
      if (yearDifference !== 0) {
        return yearDifference;
      }

      // Compare months if years are equal
      const monthDifference = dateA.getMonth() - dateB.getMonth();
      if (monthDifference !== 0) {
        return monthDifference;
      }

      // Compare days if years and months are equal
      return dateA.getDate() - dateB.getDate();
    });
  }

  toggleBookmark(movie: IFilm) {
    movie.isBookmarked = !movie.isBookmarked;

    // Check if local storage is available in the browser
    if (typeof localStorage !== 'undefined') {
      const movieId = movie.id; // Replace with your unique identifier for the movie

      if (movie.isBookmarked) {
        // Handle bookmarking action
        this.bookmarkService.addBookmark(movie);
        localStorage.setItem(`bookmark_${movieId}`, 'true');
      } else {
        // Handle unbookmarking action
        // Remove the bookmarked status from local storage
        localStorage.removeItem(`bookmark_${movieId}`);
        this.bookmarkService.removeBookmark(movie);
      }
    }
  }
}
