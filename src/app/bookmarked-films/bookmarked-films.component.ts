import { Component, OnInit } from '@angular/core';
import { IFilm } from '../filmresult';
import { DatabaseService } from '../service/database.service';
import { genreBucket, genreName, genreColor, GenreBucket } from '../genres';

type SortKey = 'year-desc' | 'year-asc' | 'title-az' | 'title-za';

@Component({
  selector: 'app-bookmarked-films',
  templateUrl: './bookmarked-films.component.html',
  styleUrls: ['./bookmarked-films.component.css'],
})
export class BookmarkedFilmsComponent implements OnInit {
  private allFilms: IFilm[] = [];
  collection: IFilm[] = []; // bookmarked films
  displayed: IFilm[] = []; // collection after filter + sort
  isLoading = true;

  // Filter / sort / view state
  selectedGenre: GenreBucket | 'All' = 'All';
  selectedYear = 'All years';
  selectedSort: SortKey = 'year-desc';
  viewMode: 'grid' | 'list' = 'grid';
  openMenu: 'genre' | 'year' | 'sort' | null = null;

  yearOptions: string[] = ['All years'];
  readonly genreOrder: GenreBucket[] = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Family', 'Romance', 'Classic',
  ];
  readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'year-desc', label: 'Year — newest first' },
    { key: 'year-asc', label: 'Year — oldest first' },
    { key: 'title-az', label: 'Title — A to Z' },
    { key: 'title-za', label: 'Title — Z to A' },
  ];

  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.getFilms();
  }

  async getFilms() {
    this.isLoading = true;
    this.allFilms = (await this.databaseService.getAllFilms()) || [];
    this.recomputeCollection();
    this.isLoading = false;
  }

  private recomputeCollection() {
    this.collection = this.allFilms.filter((m) => m.isBookmarked);
    const years = Array.from(
      new Set(this.collection.map((m) => (m.release_date || '').slice(0, 4)))
    )
      .filter(Boolean)
      .sort((a, b) => Number(b) - Number(a));
    this.yearOptions = ['All years', ...years];
    this.refresh();
  }

  private refresh() {
    let list = [...this.collection];
    if (this.selectedGenre !== 'All') {
      list = list.filter((m) => genreBucket(m) === this.selectedGenre);
    }
    if (this.selectedYear !== 'All years') {
      list = list.filter((m) =>
        (m.release_date || '').startsWith(this.selectedYear)
      );
    }
    list.sort((a, b) => {
      switch (this.selectedSort) {
        case 'title-az':
          return a.title.localeCompare(b.title);
        case 'title-za':
          return b.title.localeCompare(a.title);
        case 'year-asc':
          return (
            new Date(a.release_date).getTime() -
            new Date(b.release_date).getTime()
          );
        default:
          return (
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime()
          );
      }
    });
    this.displayed = list;
  }

  // ----- Filter controls -----

  availableGenres(): GenreBucket[] {
    const present = new Set(this.collection.map((m) => genreBucket(m)));
    return this.genreOrder.filter((g) => present.has(g));
  }

  setGenre(g: GenreBucket | 'All') {
    this.selectedGenre = g;
    this.openMenu = null;
    this.refresh();
  }

  setYear(y: string) {
    this.selectedYear = y;
    this.openMenu = null;
    this.refresh();
  }

  setSort(key: SortKey) {
    this.selectedSort = key;
    this.openMenu = null;
    this.refresh();
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleMenu(menu: 'genre' | 'year' | 'sort') {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  get sortLabel(): string {
    return (
      this.sortOptions.find((o) => o.key === this.selectedSort)?.label ||
      'Sort'
    );
  }

  get hasActiveFilter(): boolean {
    return this.selectedGenre !== 'All' || this.selectedYear !== 'All years';
  }

  get showingLabel(): string {
    const total = this.collection.length;
    if (!this.hasActiveFilter) {
      return `Showing all ${total} bookmark${total === 1 ? '' : 's'}`;
    }
    return `Showing ${this.displayed.length} of ${total} bookmarks`;
  }

  // ----- Card helpers -----

  pillColor(movie: IFilm): string {
    return genreColor(movie, document.documentElement.getAttribute('data-theme') === 'dark');
  }

  genre(movie: IFilm): string {
    return genreName(movie);
  }

  posterUrl(movie: IFilm): string | null {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
      : null;
  }

  posterLabel(movie: IFilm): string {
    const words = (movie.title || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 4).toUpperCase();
    }
    const acronym = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
    return `${acronym}.`;
  }

  toggleBookmark(movie: IFilm) {
    movie.isBookmarked = !movie.isBookmarked;
    if (movie._id) {
      this.databaseService.updateFilm(movie._id.toString(), movie);
    }
    // Removing a bookmark drops it from the collection view.
    this.recomputeCollection();
  }
}
