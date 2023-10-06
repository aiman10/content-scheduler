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
  importedMovies: any[] = [];
  showSelect = false;
  showImportSection = false;
  selectAll: boolean = false;

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

  toggleExportSection() {
    // Hide import section when export section is toggled
    this.showImportSection = false;
  }
  toggleImportSection() {
    this.showImportSection = !this.showImportSection;
  }

  toggleSelectAll() {
    for (const movie of this.importedMovies) {
      movie.selected = this.selectAll;
    }
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.showSelect = !this.showSelect;
      // Read the JSON file and populate the importedMovies array
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.importedMovies = JSON.parse(content);
      };
      reader.readAsText(file);
    }
  }

  addSelectedMovies() {
    // Add selected movies from importedMovies to bookmarkedMovies
    const selectedMovies = this.importedMovies.filter(
      (movie) => movie.selected
    );
    this.bookmarkedMovies.push(...selectedMovies);

    // Clear the importedMovies array
    this.importedMovies = [];
  }

  exportToJSON() {
    const exportData = this.bookmarkedMovies.map((movie) => ({
      title: movie.title,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
      id: movie.id,
      isBookmarked: true,
    }));

    const jsonContent = JSON.stringify(exportData, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarked_movies.json';

    // Trigger a click event to start the download
    a.click();

    // Release the URL object
    window.URL.revokeObjectURL(url);
  }
}
