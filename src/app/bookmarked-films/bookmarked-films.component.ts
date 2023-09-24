import { Component, OnInit } from '@angular/core';
import { IFilm } from '../filmresult';
import { ActivatedRoute } from '@angular/router';
import { BookmarkService } from '../service/bookmarked.service';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { SelectdateService } from '../service/selectdate.service';
import { Papa } from 'ngx-papaparse';

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
    private dateService: SelectdateService,
    private papa: Papa
  ) {}

  //TODO Add export/import localstorage/bookmarked movies to file
  ngOnInit(): void {
    this.bookmarkedMovies = this.bookmarkService.bookmarkedMovies;
    this.sortBookmarkedMoviesByMonth();
  }

  sortBookmarkedMoviesByMonth() {
    this.bookmarkedMovies.sort((a, b) => {
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);

      return dateA.getMonth() - dateB.getMonth();
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

  exportToCSV() {
    const exportData = this.bookmarkedMovies.map((movie) => ({
      Title: movie.title,
      ReleaseYear: new Date(movie.release_date).getFullYear(),
      PosterPath: movie.poster_path,
      Id: movie.id,
    }));

    const csv = this.papa.unparse(exportData, {
      header: true,
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarked_movies.csv';

    // Trigger a click event to start the download
    a.click();

    // Release the URL object
    window.URL.revokeObjectURL(url);
  }
}
