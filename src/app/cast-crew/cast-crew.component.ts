import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectdateService } from '../service/selectdate.service';
import { DatabaseService } from '../service/database.service';
import { CastCrew } from '../cast-crew';
import { MONTH_NAMES } from '../date-utils';

@Component({
  selector: 'app-cast-crew',
  templateUrl: './cast-crew.component.html',
  styleUrls: ['./cast-crew.component.css'],
})
export class CastCrewComponent implements OnInit {
  private _selectedView = 'Month';

  loading = true;

  selectedMonth: number;
  selectedYear: number;
  selectedDate = new Date();
  actors: CastCrew[] = [];
  actresses: CastCrew[] = [];
  directors: CastCrew[] = [];
  composers: CastCrew[] = [];
  allcastCrew: CastCrew[] = [];
  weeks: number[][] = [];
  months: string[] = MONTH_NAMES;

  constructor(
    private router: Router,
    private dateService: SelectdateService,
    private databaseService: DatabaseService
  ) {
    const currentDate = new Date();
    this.selectedMonth = currentDate.getMonth();
    this.selectedYear = currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.getCastCrew(); // fetch the dataset once
    this.generateMonthCalendar();
  }

  async getCastCrew() {
    this.loading = true;
    this.actors = await this.databaseService.getActors();
    this.actresses = await this.databaseService.getAcresses();
    this.directors = await this.databaseService.getDirectors();
    this.composers = await this.databaseService.getComposer();

    this.allcastCrew = [
      ...this.actors,
      ...this.actresses,
      ...this.directors,
      ...this.composers,
    ].filter(
      (thing, index, self) =>
        index === self.findIndex((t) => t.Title === thing.Title)
    );

    this.loading = false;
  }

  generateMonthCalendar(): void {
    // Rebuild from the already-loaded dataset (no re-fetch on navigation).
    this.weeks = [];

    const currentDate = new Date(this.selectedYear, this.selectedMonth, 1);
    const firstDayOfWeek = (currentDate.getDay() + 6) % 7; // Mon=0 .. Sun=6
    const lastDayOfMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();

    let currentDay = 1;
    let currentWeek: number[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(0);
    }

    while (currentDay <= lastDayOfMonth) {
      currentWeek.push(currentDay);
      if (currentWeek.length === 7) {
        this.weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDay++;
    }

    while (currentWeek.length < 7) {
      currentWeek.push(0);
    }
    if (currentWeek.length > 0) {
      this.weeks.push(currentWeek);
    }
  }

  generateWeekCalendar(): void {
    this.weeks = [];

    const startDate = new Date(this.selectedDate);
    const dayOfWeek = (this.selectedDate.getDay() + 6) % 7;
    startDate.setDate(this.selectedDate.getDate() - dayOfWeek);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const currentWeek: number[] = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      currentWeek.push(d.getDate());
    }
    this.weeks.push(currentWeek);
  }

  // ----- Counts -----

  get birthdaysThisMonth(): number {
    const mm = String(this.selectedMonth + 1).padStart(2, '0');
    return this.allcastCrew.filter(
      (p) => p.Birthday && p.Birthday.substring(5, 7) === mm
    ).length;
  }

  // ----- Navigation -----

  previousMonth(): void {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.generateMonthCalendar();
  }

  nextMonth(): void {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.generateMonthCalendar();
  }

  goToToday(): void {
    const now = new Date();
    this.selectedMonth = now.getMonth();
    this.selectedYear = now.getFullYear();
    this.generateMonthCalendar();
  }

  goToDayView(): void {
    this.dateService.selectedDate = this.selectedDate;
    this.router.navigate(['/castcrew/', this.formatDateToISO(this.selectedDate)]);
  }

  onDayClick(day: number): void {
    if (day === 0) return;
    // Fresh Date instead of mutating the shared selectedDate in place.
    const selected = new Date(this.selectedYear, this.selectedMonth, day);
    this.selectedDate = selected;
    this.dateService.selectedDate = selected;
    this.router.navigate(['/castcrew/', this.formatDateToISO(selected)]);
  }

  formatDateToISO(inputDate: Date): string {
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(day: number): string {
    const month = Number(this.selectedMonth) + 1;
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedDay = day < 10 ? `0${day}` : day.toString();
    return `${formattedMonth}-${formattedDay}`;
  }

  getPeopleForDay(day: number): CastCrew[] {
    const dayStr = this.formatDate(day);
    return this.allcastCrew
      .filter((person) => person.Birthday.slice(5) === dayStr)
      .slice(0, 3);
  }

  getPeopleForWeek(day: number): CastCrew[] {
    const dayStr = this.formatDate(day);
    return this.allcastCrew.filter(
      (person) => person.Birthday.slice(5) === dayStr
    );
  }

  getPersonCountForDay(day: number): number {
    const dayStr = this.formatDate(day);
    const total = this.allcastCrew.filter(
      (person) => person.Birthday.slice(5) === dayStr
    ).length;
    return total - Math.min(total, 3);
  }

  public get selectedView() {
    return this._selectedView;
  }
  public set selectedView(value) {
    this._selectedView = value;
    if (this.selectedView === 'Month') {
      this.generateMonthCalendar();
    } else {
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

  isToday(day: number): boolean {
    const currentDate = new Date();
    return (
      day === currentDate.getDate() &&
      this.selectedMonth === currentDate.getMonth() &&
      this.selectedYear === currentDate.getFullYear()
    );
  }
}
