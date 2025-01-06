import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { IFilm, Result } from '../filmresult';
import { BookmarkService } from '../service/bookmarked.service';
import { ICalendar } from 'datebook';
import { SelectdateService } from '../service/selectdate.service';
import { DatabaseService } from '../service/database.service';

@Component({
  selector: 'app-calendar-detail',
  templateUrl: './calendar-detail.component.html',
  styleUrls: ['./calendar-detail.component.css'],
})
export class CalendarDetailComponent implements OnInit {
  selectedYear!: number;
  bookmarkedMovies: IFilm[] = [];

  years: number[] = Array.from(
    { length: 61 }, // Change the length to cover a larger range of years
    (_, i) => new Date().getFullYear() - 60 + i
  );
  date = '';
  films: IFilm[] = [];
  result: Result = { page: 1, total_pages: 1, results: [], total_results: 0 }; // Added total_results property
  editing: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService,
    //private bookmarkService: BookmarkService,
    private dateService: SelectdateService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.date = params['date']; // Access the 'date' parameter
      this.selectedYear = Number(this.date.substring(0, 4));

      // Extract the month and day from the date parameter
      const selectedMonthDay = this.date.substring(5); // Assuming 'date' is in 'YYYY-MM-DD' format

      // Get all bookmarked movies from the database
      this.getDatabaseFilms();

      // Filter the bookmarkedMovies array to only include movies released on the selected day and month
      this.bookmarkedMovies = this.bookmarkedMovies.filter((movie) => {
        const movieMonthDay = movie.release_date.substring(5);
        return movieMonthDay === selectedMonthDay;
      });

      this.getFilms(1);
    });
  }

  enableEditing(movie: IFilm) {
    this.editing[movie.id] = true;
  }

  disableEditing(movie: IFilm) {
    this.editing[movie.id] = false;
  }

  updateReleaseDate(event: any, movie: IFilm) {
    const newDate = event.target.value;
    movie.release_date = newDate;
    this.disableEditing(movie);
    if (movie._id) {
      this.databaseService.updateFilm(movie._id.toString(), movie);
    }
  }

  calculateReleasedYearsAgo(movie: IFilm): number {
    const releaseYear = new Date(movie.release_date).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - releaseYear;
  }

  async getDatabaseFilms() {
    this.bookmarkedMovies = (await this.databaseService.getAllFilms()).filter(
      (movie) => {
        const [movieYear, movieMonth, movieDay] = movie.release_date.split('-');
        const [filterYear, filterMonth, filterDay] = this.date.split('-');
        return movieMonth === filterMonth && movieDay === filterDay;
      }
    );
    //console.log(this.bookmarkedMovies);
  }

  async getFilms(id: number) {
    this.result = await this.movieService.getFilms(this.date, id);

    this.films = this.result.results.sort((a, b) => {
      return b.popularity - a.popularity;
    });
  }

  toggleBookmark(movie: IFilm) {
    movie.isBookmarked = !movie.isBookmarked;
    console.log(movie);
    if (movie._id) {
      this.databaseService.updateFilm(movie._id.toString(), movie);
    }
  }

  //TODO: add toggleBookmark for new movies
  addToggleBookmark(movie: IFilm) {}

  onDateChange() {
    this.date = this.selectedYear + this.date.substring(4); // Keep the rest of the date as it is
    const dateString = `${this.selectedYear}${this.date.substring(4)}`;
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is zero-based (0-11)
    const day = parseInt(dateParts[2]);
    const newDate = new Date(year, month, day);
    //console.log(newDate);

    this.dateService.selectedDate = newDate;
    this.getFilms(1);
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
    eventEnd.setDate(eventDate.getDate() + 1); // assuming event lasts 1 day

    const config = {
      title: film.title,
      description: 'Movie release date',
      start: eventDate,
      end: eventEnd,
      allDay: true,
    };

    const icsCalendar = new ICalendar(config);

    // Generate the calendar data
    const icsData = icsCalendar.render();

    // Create a Blob from the ICS data
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', `${film.title}.ics`);

    // Append link to the body, trigger click, and remove it after
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  generateICSCalendar(film: IFilm): string {
    const eventDate = new Date(this.date);
    const eventYear = eventDate.getFullYear();
    const eventMonth = (eventDate.getMonth() + 1).toString().padStart(2, '0');
    const eventDay = eventDate.getDate().toString().padStart(2, '0');

    // Format the date to YYYYMMDD
    const formattedDate = `${eventYear}${eventMonth}${eventDay}`;

    // Event details
    const eventName = film.title;

    // Generate a UID (you should generate a unique one for each event)
    const uid = '1234567890';

    // Get the current date and time in UTC format
    const dtstamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z/, 'Z');

    // Generate the ICS event for a single film
    const icsContent = `
    BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:My Angular Calendar App
    BEGIN:VEVENT
    DTSTAMP:${dtstamp}
    DTSTART:${formattedDate}T000000Z
    DTEND:${formattedDate}T235959Z
    SUMMARY:${eventName}
    UID:${uid}
    END:VEVENT
    END:VCALENDAR
  `;

    return icsContent;
  }
}
