import { Component, OnInit } from '@angular/core';
import { IFilm } from '../filmresult';
import { ActivatedRoute } from '@angular/router';
import { BookmarkService } from '../service/bookmarked.service';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { SelectdateService } from '../service/selectdate.service';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from '../service/database.service';

@Component({
  selector: 'app-bookmarked-films',
  templateUrl: './bookmarked-films.component.html',
  styleUrls: ['./bookmarked-films.component.css'],
})
export class BookmarkedFilmsComponent implements OnInit {
  bookmarkedMovies: IFilm[] = [];
  filterValues: string[] = ['All', 'Bookmarked'];
  selectedValue = 'All';
  yearOptions: string[] = ['All Years'];
  selectedYear = 'All Years';
  sortOptions: string[] = [
    'Year Desc',
    'Year Asc',
    'Alphabetical A-Z',
    'Alphabetical Z-A',
  ];
  selectedSort = 'Year Desc';
  isLoading = true;
  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService,
    private bookmarkService: BookmarkService,
    private dateService: SelectdateService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.getFilms();
  }

  async getFilms() {
    this.isLoading = true;
    const allMovies = await this.databaseService.getAllFilms();
    this.updateYearOptions(allMovies);

    let filtered = allMovies;
    if (this.selectedValue === 'Bookmarked') {
      filtered = filtered.filter((movie) => movie.isBookmarked);
    }

    if (this.selectedYear !== 'All Years') {
      filtered = filtered.filter((movie) =>
        movie.release_date.startsWith(this.selectedYear)
      );
    }

    this.bookmarkedMovies = filtered;
    this.applySort();
    this.isLoading = false;
  }

  updateYearOptions(movies: IFilm[]) {
    const years = Array.from(
      new Set(movies.map((m) => m.release_date.slice(0, 4)))
    ).sort((a, b) => Number(b) - Number(a));
    this.yearOptions = ['All Years', ...years];
  }

  applySort() {
    const option = this.selectedSort;
    this.bookmarkedMovies.sort((a, b) => {
      if (option === 'Alphabetical A-Z') {
        return a.title.localeCompare(b.title);
      } else if (option === 'Alphabetical Z-A') {
        return b.title.localeCompare(a.title);
      } else if (option === 'Year Asc') {
        return (
          new Date(a.release_date).getTime() -
          new Date(b.release_date).getTime()
        );
      }
      return (
        new Date(b.release_date).getTime() -
        new Date(a.release_date).getTime()
      );
    });
  }

  toggleBookmark(movie: IFilm) {
    movie.isBookmarked = !movie.isBookmarked;
    if (movie._id) {
      this.databaseService.updateFilm(movie._id.toString(), movie);
    }
  }

  onFilterChange(): void {
    this.getFilms();
  }

  onSortChange(): void {
    this.applySort();
  }
  //add a dropdown list to filter movies on favorites, release year
}
