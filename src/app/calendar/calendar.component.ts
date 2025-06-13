import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import * as moment from 'moment';
import { BookmarkService } from '../service/bookmarked.service';
import { IFilm } from '../filmresult';
import { SelectdateService } from '../service/selectdate.service';
import { ImdbService } from '../service/imdb.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { DatabaseService } from '../service/database.service';
import { ICalendar } from 'datebook';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      transition('void <=> *', animate(400)),
    ]),
  ],
})
export class CalendarComponent implements OnInit {
  private _selectedView = 'Month';
  loading = false;
  selectedMonth: number;
  selectedYear: number;
  selectedDate = new Date();
  bookmarkedMovies: IFilm[] = [];
  weeks: number[][] = [];
  actorList: String[] = [];
  months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  years: number[] = Array.from(
    { length: 62 }, // Change the length to cover a larger range of years
    (_, i) => new Date().getFullYear() - 60 + i
  );
  hoveredDay: number | null = null;
  hoverTimeout: any = null;
  constructor(
    private router: Router,
    private service: BookmarkService,
    private dateService: SelectdateService,
    private imdb: ImdbService,
    private databaseService: DatabaseService
  ) {
    const currentDate = new Date();
    this.selectedMonth = currentDate.getMonth();
    this.selectedYear = currentDate.getFullYear();
    //this.selectedMonth = this.dateService.selectedDate.getMonth();
    //this.selectedYear = this.dateService.selectedDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateMonthCalendar();
    //this.getActors();
    //console.log(this.service.bookmarkedMovies);
  }

  async getFilms() {
    this.loading = true;
    const allMovies = await this.databaseService.getAllFilms();
    this.bookmarkedMovies = allMovies.filter(
      (m) => new Date(m.release_date).getFullYear() === this.selectedYear
    );
    this.loading = false;
  }

  async getActors() {
    this.actorList = await this.imdb.getActors(9, 2);
    //console.log(this.actorList);
  }

  generateMonthCalendar(): void {
    // Clear the weeks array
    //this.bookmarkedMovies = this.service.bookmarkedMovies;
    this.getFilms();
    this.weeks = [];

    // Create a new date for the selected month and year
    const currentDate = new Date(this.selectedYear, this.selectedMonth, 1);

    // Find the first day of the week for the selected month
    // Adjust so the week starts on Monday instead of Sunday
    const firstDayOfWeek = (currentDate.getDay() + 6) % 7; // 0 (Monday) to 6 (Sunday)

    // Get the number of days in the selected month
    const lastDayOfMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();

    // Calculate the number of days to add before the first day of the month
    const daysBefore = firstDayOfWeek;

    // Calculate the total number of days to display (5 weeks x 7 days)
    const totalDays = 5 * 7;

    // Initialize variables for tracking the current day and week
    let currentDay = 1;
    let currentWeek: number[] = [];

    // Fill in empty days before the first day of the month
    for (let i = 0; i < daysBefore; i++) {
      currentWeek.push(0); // Use null to represent empty days
    }

    // Populate the days of the month
    while (currentDay <= lastDayOfMonth) {
      currentWeek.push(currentDay);

      // If we've reached the end of the week, start a new week
      if (currentWeek.length === 7) {
        this.weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDay++;
    }

    // Add the remaining empty days to complete 5 weeks
    while (currentWeek.length < 7) {
      currentWeek.push(0); // Use null to represent empty days
    }
    if (currentWeek.length > 0) {
      this.weeks.push(currentWeek); // Ensure that the last week gets added to the weeks array
    }

    // Add the weeks to ensure you have a total of 5 weeks
    while (this.weeks.length < 5) {
      this.weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  generateWeekCalendar(): void {
    // Clear the weeks array
    this.weeks = [];

    // Assume that selectedDate is the date around which you want to build your week view.
    const startDate = new Date(this.selectedDate);
    // Adjust so the week starts on Monday
    const dayOfWeek = (this.selectedDate.getDay() + 6) % 7; // 0 (Monday) to 6 (Sunday)
    startDate.setDate(this.selectedDate.getDate() - dayOfWeek);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const currentWeek: number[] = [];

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      currentWeek.push(d.getDate());
    }

    this.weeks.push(currentWeek);
  }

  onDateChange(): void {
    this.generateMonthCalendar();
  }

  onDayClick(day: number): void {
    this.selectedDate.setFullYear(this.selectedYear, this.selectedMonth, day);
    this.dateService.selectedDate = this.selectedDate;
    const formattedDate = this.formatDateToISO(this.selectedDate);
    //console.log(formattedDate);
    //console.log(this.selectedDate);
    this.router.navigate(['/detail/', formattedDate]);
  }

  formatDateToISO(inputDate: Date): string {
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(inputDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(day: number): string {
    const month = Number(this.selectedMonth) + 1;
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedDay = day < 10 ? `0${day}` : day.toString();
    return `${formattedMonth}-${formattedDay}`;
  }

  getMoviesForDay(day: number): any[] {
    const dayStr = this.formatDate(day);
    const moviesForDay = this.bookmarkedMovies
      .filter((movie) => movie.release_date.slice(5) === dayStr)
      .sort((a, b) => (b.isBookmarked ? 1 : -1) - (a.isBookmarked ? 1 : -1)); // This line sorts the movies
    return moviesForDay.slice(0, 3);
  }

  getMoviesForWeek(day: number): any[] {
    const dayStr = this.formatDate(day);
    const moviesForDay = this.bookmarkedMovies.filter(
      (movie) => movie.release_date.slice(5) === dayStr
    );
    return moviesForDay;
  }

  getMovieCountForDay(day: number): number {
    const dayStr = this.formatDate(day);
    const moviesForDay = this.bookmarkedMovies.filter(
      (movie) => movie.release_date.slice(5) === dayStr
    );
    return moviesForDay.length - this.getMoviesForDay(day).length;
  }

  isHovered(day: number): boolean {
    return this.hoveredDay === day;
  }

  onDayMouseEnter(day: number): void {
    this.hoverTimeout = setTimeout(() => {
      this.hoveredDay = day;
    }, 400); // 2000 milliseconds (2 seconds) delay
  }

  onDayMouseLeave(): void {
    clearTimeout(this.hoverTimeout); // clear the timeout
    this.hoveredDay = null;
  }

  getFullMoviesForDay(day: number): any[] {
    const dayStr = this.formatDate(day);
    return this.bookmarkedMovies.filter(
      (movie) => movie.release_date.slice(5) === dayStr
    );
  }
  public get selectedView() {
    return this._selectedView;
  }
  public set selectedView(value) {
    this._selectedView = value;
    if (this.selectedView === 'Month') {
      console.log('Month');
      this.generateMonthCalendar();
    } else {
      console.log('Week');
      this.generateWeekCalendar();
    }
  }

  previousWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 7);
    this.selectedMonth = this.selectedDate.getMonth();

    this.generateWeekCalendar();
  }

  nextWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 7);
    this.selectedMonth = this.selectedDate.getMonth();

    this.generateWeekCalendar();
  }

  previousYear(): void {
    this.selectedYear--;
    this.generateMonthCalendar();
  }

  nextYear(): void {
    this.selectedYear++;
    this.generateMonthCalendar();
  }

  toggleBookmark(movie: IFilm) {
    movie.isBookmarked = !movie.isBookmarked;
    if (movie._id) {
      this.databaseService.updateFilm(movie._id.toString(), movie);
    }
  }

  downloadICSCalendar(movie: IFilm) {
    const eventDate = new Date(movie.release_date);
    const eventEnd = new Date(movie.release_date);
    eventEnd.setDate(eventEnd.getDate() + 1);

    const config = {
      title: movie.title,
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
    downloadLink.setAttribute('download', `${movie.title}.ics`);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  isToday(day: number): boolean {
    const currentDate = new Date();
    return (
      day === currentDate.getDate() &&
      this.selectedMonth === currentDate.getMonth() &&
      this.selectedYear === currentDate.getFullYear()
    );
  }
}
