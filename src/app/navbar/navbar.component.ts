import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild,
  Inject,
} from '@angular/core';
import { IFilm } from '../filmresult';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { BookmarkService } from '../service/bookmarked.service';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { DatabaseService } from '../service/database.service';

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
  @ViewChild('dropdownMenu', { static: false }) dropdownMenu!: ElementRef;

  bookmarkedMovies: IFilm[] = [];
  teller = 0;
  constructor(
    private service: MoviedatabaseService,
    private bookmarkService: BookmarkService,
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    this.bookmarkedMovies = await this.databaseService.getAllFilms();
  }

  async onSearch(event: any) {
    const query = event.target.value; // Get the search query
    if (query) {
      const searchResults = (await this.service.searchFilm(query, 0)).results;
      this.filmResult = searchResults;
      // Check if searchMovie is in bookmarkedMovies by comparing IDs
      this.filmResult = searchResults.map((searchMovie) => {
        // Check if searchMovie is in bookmarkedMovies by comparing IDs and isBookmarked is true
        const isBookmarked = this.bookmarkedMovies.some(
          (movie) => movie.id === searchMovie.id && movie.isBookmarked
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
    if (
      this.searchInput.nativeElement.contains(event.target) ||
      (this.dropdownMenu &&
        this.dropdownMenu.nativeElement.contains(event.target))
    ) {
      // Click occurred inside the search input or the dropdown menu, show the dropdown
      if (this.filmResult && this.filmResult.length > 0) {
        this.showDropdown = true;
      }
    } else {
      // Click occurred outside, hide the search results
      this.showDropdown = false;
      //console.log('Hiding dropdown');
    }
  }

  async toggleBookmark(movie: IFilm) {
    //check if movie is in bookmarkedmovies return true or false
    const isBookmarked = this.bookmarkedMovies.some(
      (bookmarkedMovie) => bookmarkedMovie.id === movie.id
    );
    console.log(isBookmarked);
    if (isBookmarked == true) {
      console.log('true');
      const existingMovie = await this.databaseService.getFilmByName(
        movie.title
      );
      existingMovie.isBookmarked = !existingMovie.isBookmarked;

      this.databaseService.updateFilm(
        existingMovie._id!.toString(),
        existingMovie
      );

      //update movies in search
      this.filmResult = this.filmResult?.map((film) => {
        if (film.id === movie.id) {
          return { ...film, isBookmarked: existingMovie.isBookmarked };
        }
        return film;
      });
    } else {
      console.log('false');
      movie.isBookmarked = !movie.isBookmarked;
      try {
        const releaseData = await this.service.getReleaseDates(movie.id);
        // Find the US release data among the results
        const usReleaseData = releaseData.results.find(
          (result) => result.iso_3166_1 === 'US'
        );

        if (usReleaseData) {
          // Filter out the US release dates of type 3
          let usReleaseDates = usReleaseData.release_dates.filter(
            (date) => date.type === 3
          );

          // If no type 3 dates are found, try to find type 4
          if (usReleaseDates.length === 0) {
            usReleaseDates = usReleaseData.release_dates.filter(
              (date) => date.type === 4
            );
          }

          console.log(usReleaseDates);
          const formattedDate = new Date(usReleaseDates[0].release_date)
            .toISOString()
            .split('T')[0];
          movie.release_date = formattedDate;
          this.databaseService.createFilm(movie);

          //update movies in search
          this.filmResult = this.filmResult?.map((film) => {
            if (film.id === movie.id) {
              return { ...film, isBookmarked: movie.isBookmarked };
            }
            return film;
          });
        } else {
          console.error('No US release data found');
        }
      } catch (error) {
        console.error('Error fetching release dates:', error);
      }
    }
  }
}
