import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import * as moment from 'moment';
import { BookmarkService } from '../service/bookmarked.service';
import { IFilm } from '../filmresult';
import { SelectdateService } from '../service/selectdate.service';
import { ImdbService } from '../service/imdb.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
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

  constructor(
    private router: Router,
    private service: BookmarkService,
    private dateService: SelectdateService,
    private imdb: ImdbService
  ) {
    this.selectedMonth = this.dateService.selectedDate.getMonth();
    this.selectedYear = this.dateService.selectedDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateCalendar();
    this.getActors();
    //console.log(this.service.bookmarkedMovies);
  }

  async getActors() {
    this.actorList = await this.imdb.getActors(9, 2);
    console.log(this.actorList);
  }

  generateCalendar(): void {
    // Clear the weeks array
    this.bookmarkedMovies = this.service.bookmarkedMovies;
    this.weeks = [];

    // Create a new date for the selected month and year
    const currentDate = new Date(this.selectedYear, this.selectedMonth, 1);

    // Find the first day of the week for the selected month
    const firstDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

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

    // Add the weeks to ensure you have a total of 5 weeks
    while (this.weeks.length < 5) {
      this.weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  onDateChange(): void {
    this.generateCalendar();
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
}
