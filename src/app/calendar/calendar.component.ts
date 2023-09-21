import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import * as moment from 'moment';
import { BookmarkService } from '../service/bookmarked.service';
import { IFilm } from '../filmresult';
import { SelectdateService } from '../service/selectdate.service';

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
    { length: 61 }, // Change the length to cover a larger range of years
    (_, i) => new Date().getFullYear() - 60 + i
  );

  constructor(
    private router: Router,
    private service: BookmarkService,
    private dateService: SelectdateService
  ) {
    this.selectedMonth = this.dateService.selectedDate.getMonth();
    this.selectedYear = this.dateService.selectedDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateCalendar();
    //console.log(this.service.bookmarkedMovies);
  }

  generateCalendar(): void {
    this.bookmarkedMovies = this.service.bookmarkedMovies;
    console.log(this.bookmarkedMovies);
    // Clear the weeks array
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

    // Initialize variables for tracking the current day and week
    let currentDay = 1;
    let currentWeek: number[] = [];

    // Fill in empty days at the beginning of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
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

    // Add the last week if it's not a full week
    if (currentWeek.length > 0) {
      this.weeks.push(currentWeek);
    }
  }

  onDateChange(): void {
    this.generateCalendar();
  }

  onDayClick(day: number): void {
    this.selectedDate.setFullYear(this.selectedYear, this.selectedMonth, day);
    this.dateService.selectedDate = this.selectedDate;
    const formattedDate = this.selectedDate.toISOString().slice(0, 10);
    this.router.navigate(['/detail/', formattedDate]);
  }

  formatDate(month: number, day: number): string {
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedDay = day < 10 ? `0${day}` : day.toString();
    return `${formattedMonth}-${formattedDay}`;
  }
}
