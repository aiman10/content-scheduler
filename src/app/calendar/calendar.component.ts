import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  selectedMonth: number;
  selectedYear: number;
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

  constructor(private router: Router) {
    const currentDate = new Date();
    this.selectedMonth = currentDate.getMonth();
    this.selectedYear = currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
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
    const selectedDate = new Date(
      this.selectedYear,
      this.selectedMonth,
      day + 1
    );
    const formattedDate = selectedDate.toISOString().slice(0, 10);

    // Log the full date

    this.router.navigate(['/detail/', formattedDate]);
  }
}
