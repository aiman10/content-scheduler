import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { IFilm } from '../filmresult';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { BookmarkService } from '../service/bookmarked.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  showDropdown = false; // Control whether to show the dropdown
  filmResult: IFilm[] | undefined;
  imageUrl = 'https://image.tmdb.org/t/p/original';
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef; // Initialize searchInput

  constructor(
    private service: MoviedatabaseService,
    private bookmarkService: BookmarkService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {}

  async onSearch(event: any) {
    const query = event.target.value; // Get the search query
    if (query) {
      //this.filmResult = (await this.service.searchFilm(query, 0)).results;
      const searchResults = (await this.service.searchFilm(query, 0)).results;
      this.filmResult = searchResults.map((searchMovie) => {
        // Check if searchMovie is in bookmarkedMovies by comparing IDs
        const isBookmarked = this.bookmarkService.bookmarkedMovies.some(
          (bookmarkedMovie) => bookmarkedMovie.id === searchMovie.id
        );

        return { ...searchMovie, isBookmarked };
      });
    } else {
      // If the query is empty, clear the search results and hide the dropdown
      this.filmResult = [];
    }
    this.showDropdown = query.length > 0;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.searchInput.nativeElement.contains(event.target)) {
      // Click occurred inside the search input, show the dropdown
      if (this.filmResult && this.filmResult.length > 0) {
        this.showDropdown = true;
      }
    } else {
      // Click occurred outside, hide the search results
      this.showDropdown = false;
      console.log('Hiding dropdown');
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
}
