import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { IFilm, Result } from '../filmresult';
import { BookmarkService } from '../service/bookmarked.service';
import { SelectdateService } from '../service/selectdate.service';

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

  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService,
    private bookmarkService: BookmarkService,
    private dateService: SelectdateService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.date = params['date']; // Access the 'date' parameter
      this.selectedYear = Number(this.date.substring(0, 4));

      // Extract the month and day from the date parameter
      const selectedMonthDay = this.date.substring(5); // Assuming 'date' is in 'YYYY-MM-DD' format

      // Get all bookmarked movies from the service
      this.bookmarkedMovies = this.bookmarkService.bookmarkedMovies;

      // Filter the bookmarkedMovies array to only include movies released on the selected day and month
      this.bookmarkedMovies = this.bookmarkedMovies.filter((movie) => {
        const movieMonthDay = movie.release_date.substring(5);
        return movieMonthDay === selectedMonthDay;
      });

      this.getFilms(1);
    });
  }

  async getFilms(id: number) {
    try {
      this.result = await this.movieService.getFilms(this.date, id);
      // ...
    } catch (error) {
      console.error('Error fetching films:', error);
    }
    this.films = this.result.results.sort((a, b) => {
      return b.popularity - a.popularity;
    });

    // Retrieve bookmarked status from localStorage
    this.films.forEach((movie) => {
      const movieId = movie.id.toString(); // Convert the ID to a string if it's not
      const isBookmarked = localStorage.getItem(`bookmark_${movieId}`);

      // Update the movie's isBookmarked property based on the retrieved value
      movie.isBookmarked = isBookmarked === 'true'; // Convert the string to a boolean
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
    // Generate the ICS content
    const icsContent = this.generateICSCalendar(film);

    // Create a Blob with the ICS content
    const blob = new Blob([icsContent], { type: 'text/calendar' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', `${film.title}.ics`);

    // Trigger the download
    downloadLink.click();
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
