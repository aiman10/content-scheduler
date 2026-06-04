import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { IFilm, Result } from '../filmresult';
import { ICalendar } from 'datebook';
import { SelectdateService } from '../service/selectdate.service';
import { DatabaseService } from '../service/database.service';
import { genreName, genreBucket, GenreBucket } from '../genres';

export function getIsoWeek(date: Date): number {
  // ISO-8601 week number (weeks start Monday; week 1 contains the first Thursday).
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return (
    1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
  );
}

@Component({
  selector: 'app-calendar-detail',
  templateUrl: './calendar-detail.component.html',
  styleUrls: ['./calendar-detail.component.css'],
})
export class CalendarDetailComponent implements OnInit {
  selectedYear!: number;
  bookmarkedMovies: IFilm[] = [];
  isLoadingBookmarked = false;

  years: number[] = Array.from(
    { length: 61 },
    (_, i) => new Date().getFullYear() - 60 + i
  ).reverse();

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  weekdays: string[] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ];

  date = '';
  films: IFilm[] = [];
  result: Result = { page: 1, total_pages: 1, results: [], total_results: 0 };

  // Watchlist genre filter (client-side, within the current page).
  watchlistGenre: GenreBucket | null = null;
  genreMenuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService,
    private dateService: SelectdateService,
    private databaseService: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.date = params['date'];
      this.selectedYear = Number(this.date.substring(0, 4));

      const selectedMonthDay = this.date.substring(5);

      this.getDatabaseFilms().then(() => {
        this.bookmarkedMovies = this.bookmarkedMovies.filter(
          (movie) => movie.release_date.substring(5) === selectedMonthDay
        );
      });

      this.watchlistGenre = null;
      this.getFilms(1);
    });
  }

  // ----- Header view-model (computed from this.date) -----

  private dateObj(offsetDays = 0): Date {
    const [y, m, d] = this.date.split('-').map((p) => parseInt(p, 10));
    const dt = new Date(y, m - 1, d);
    if (offsetDays) dt.setDate(dt.getDate() + offsetDays);
    return dt;
  }

  get monthName(): string {
    return this.months[this.dateObj().getMonth()];
  }

  get dayNumber(): number {
    return this.dateObj().getDate();
  }

  get headerYear(): number {
    return this.dateObj().getFullYear();
  }

  get weekdayName(): string {
    return this.weekdays[this.dateObj().getDay()];
  }

  get weekNumber(): number {
    return getIsoWeek(this.dateObj());
  }

  private dayLabel(offsetDays: number): string {
    const d = this.dateObj(offsetDays);
    return `${this.months[d.getMonth()]} ${d.getDate()}`;
  }

  get prevDayLabel(): string {
    return this.dayLabel(-1);
  }

  get nextDayLabel(): string {
    return this.dayLabel(1);
  }

  get watchlistDateLabel(): string {
    return `${this.monthName} ${this.dayNumber}`;
  }

  // ----- Card display helpers -----

  posterUrl(movie: IFilm): string | null {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
      : null;
  }

  posterInitials(movie: IFilm): string {
    const letters = (movie.title || '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '')
      .slice(0, 4);
    return (letters || '?').toUpperCase();
  }

  genreLabel(movie: IFilm): string {
    return genreName(movie);
  }

  calculateReleasedYearsAgo(movie: IFilm): number {
    const releaseYear = new Date(movie.release_date).getFullYear();
    return new Date().getFullYear() - releaseYear;
  }

  tmdbUrl(movie: IFilm): string {
    return `https://www.themoviedb.org/movie/${movie.id}`;
  }

  // ----- Watchlist genre filter -----

  get filteredFilms(): IFilm[] {
    if (!this.watchlistGenre) return this.films;
    return this.films.filter((m) => genreBucket(m) === this.watchlistGenre);
  }

  availableWatchlistGenres(): GenreBucket[] {
    const set = new Set<GenreBucket>();
    this.films.forEach((m) => set.add(genreBucket(m)));
    return Array.from(set).sort();
  }

  toggleGenreMenu(): void {
    this.genreMenuOpen = !this.genreMenuOpen;
  }

  setWatchlistGenre(g: GenreBucket | null): void {
    this.watchlistGenre = g;
    this.genreMenuOpen = false;
  }

  // ----- Data -----

  async getDatabaseFilms() {
    this.isLoadingBookmarked = true;
    this.bookmarkedMovies = (await this.databaseService.getAllFilms()) || [];
    this.isLoadingBookmarked = false;
  }

  async getFilms(id: number) {
    this.result = await this.movieService.getFilms(this.date, id);
    this.films = this.result.results.sort(
      (a, b) => b.popularity - a.popularity
    );
  }

  // Toggle bookmark on a film already stored in our DB (left column).
  toggleBookmark(movie: IFilm) {
    movie.isBookmarked = !movie.isBookmarked;
    if (movie._id) {
      this.databaseService.updateFilm(movie._id.toString(), movie);
    }
  }

  // Add a TMDB release to the DB as a bookmark (right column).
  // Mirrors navbar.component.ts#toggleBookmark create flow.
  async addToggleBookmark(movie: IFilm) {
    if (movie.isBookmarked) return;
    try {
      const releaseData = await this.movieService.getReleaseDates(movie.id);
      const usReleaseData = releaseData.results.find(
        (result) => result.iso_3166_1 === 'US'
      );

      if (usReleaseData) {
        let usReleaseDates = usReleaseData.release_dates.filter(
          (d) => d.type === 3
        );
        if (usReleaseDates.length === 0) {
          usReleaseDates = usReleaseData.release_dates.filter(
            (d) => d.type === 4
          );
        }
        if (usReleaseDates.length > 0) {
          movie.release_date = new Date(usReleaseDates[0].release_date)
            .toISOString()
            .split('T')[0];
        }
      }

      movie.isBookmarked = true;
      await this.databaseService.createFilm(movie);
    } catch (error) {
      movie.isBookmarked = false;
    }
  }

  // ----- Day / page navigation -----

  onDateChange() {
    this.date = this.selectedYear + this.date.substring(4);
    const dateString = `${this.selectedYear}${this.date.substring(4)}`;
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    this.dateService.selectedDate = new Date(year, month, day);
    this.watchlistGenre = null;
    this.getFilms(1);
  }

  onDateChangeNext() {
    this.navigateToDay(1);
  }

  onDateChangePrevious() {
    this.navigateToDay(-1);
  }

  private navigateToDay(offsetDays: number) {
    const next = this.dateObj(offsetDays);
    const y = next.getFullYear();
    const m = (next.getMonth() + 1).toString().padStart(2, '0');
    const d = next.getDate().toString().padStart(2, '0');
    this.router.navigate(['/detail', `${y}-${m}-${d}`]);
  }

  previousPage() {
    if (this.result.page > 1) {
      this.getFilms(this.result.page - 1);
    }
  }

  nextPage() {
    if (this.result.page < this.result.total_pages) {
      this.getFilms(this.result.page + 1);
    }
  }

  downloadICSCalendar(film: IFilm) {
    const eventDate = new Date(film.release_date);
    const eventEnd = new Date(film.release_date);
    eventEnd.setDate(eventDate.getDate() + 1);

    const config = {
      title: film.title,
      description: 'Movie release date',
      start: eventDate,
      end: eventEnd,
      allDay: true,
    };

    const icsCalendar = new ICalendar(config);
    const icsData = icsCalendar.render();
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });

    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', `${film.title}.ics`);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
