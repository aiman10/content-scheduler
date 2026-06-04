import { Component, OnInit } from '@angular/core';
import { CastCrew } from '../cast-crew';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../service/bookmarked.service';
import { DatabaseService } from '../service/database.service';
import { SelectdateService } from '../service/selectdate.service';
import { ICalendar } from 'datebook';
import { MONTH_NAMES, WEEKDAY_NAMES, getIsoWeek } from '../date-utils';

@Component({
  selector: 'app-cast-crew-detail',
  templateUrl: './cast-crew-detail.component.html',
  styleUrls: ['./cast-crew-detail.component.css'],
})
export class CastCrewDetailComponent implements OnInit {
  actors: CastCrew[] = [];
  actresses: CastCrew[] = [];
  directors: CastCrew[] = [];
  composers: CastCrew[] = [];
  allcastCrew: CastCrew[] = [];
  date = '';
  loading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: BookmarkService,
    private dateService: SelectdateService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    // Set date immediately from the snapshot so the header renders correctly
    // before the async DB load completes (prevents "January 1" flash).
    this.date = this.route.snapshot.params['date'] || '';
    this.getCastCrew();
  }

  // ----- Header view-model (computed from this.date, YYYY-MM-DD) -----

  private dateObj(): Date {
    const [y, m, d] = (this.date || '1970-01-01')
      .split('-')
      .map((p) => parseInt(p, 10));
    return new Date(y, m - 1, d);
  }

  get monthName(): string {
    return MONTH_NAMES[this.dateObj().getMonth()];
  }

  get dayNumber(): number {
    return this.dateObj().getDate();
  }

  get headerYear(): number {
    return this.dateObj().getFullYear();
  }

  get weekdayName(): string {
    return WEEKDAY_NAMES[this.dateObj().getDay()];
  }

  get weekNumber(): number {
    return getIsoWeek(this.dateObj());
  }

  get dayLabel(): string {
    return `${this.monthName} ${this.dayNumber}`;
  }

  // ----- Person card helpers -----

  initials(person: CastCrew): string {
    const parts = (person.Title || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]).join('');
    return (letters || '?').toUpperCase();
  }

  // Age the person turns on this birthday.
  turnsAge(person: CastCrew): number {
    return new Date().getFullYear() - new Date(person.Birthday).getFullYear();
  }

  role(person: CastCrew): string {
    if (this.actors.includes(person)) return 'Actor';
    if (this.actresses.includes(person)) return 'Actress';
    if (this.directors.includes(person)) return 'Director';
    if (this.composers.includes(person)) return 'Composer';
    return 'Cast & Crew';
  }

  async getCastCrew() {
    this.loading = true;
    this.actors = await this.databaseService.getActors();
    this.actresses = await this.databaseService.getAcresses();
    this.directors = await this.databaseService.getDirectors();
    this.composers = await this.databaseService.getComposer();

    let all: CastCrew[] = [
      ...this.actors,
      ...this.actresses,
      ...this.directors,
      ...this.composers,
    ];
    // de-duplicate by Title
    all = all.filter(
      (thing, index, self) =>
        index === self.findIndex((t) => t.Title === thing.Title)
    );

    this.route.params.subscribe((params) => {
      this.date = params['date'];
      const selectedMonthDay = this.date.substring(5);
      this.allcastCrew = all.filter(
        (person) => person.Birthday.substring(5) === selectedMonthDay
      );
      this.loading = false;
    });
  }

  // Download an .ics with a yearly-recurring birthday reminder.
  downloadYearlyReminder(person: CastCrew) {
    const eventDate = new Date(person.Birthday);
    const eventEnd = new Date(person.Birthday);
    eventEnd.setDate(eventEnd.getDate() + 1);

    const config = {
      title: `${person.Title}'s birthday`,
      description: `${this.role(person)} · born ${person.Birthday}`,
      start: eventDate,
      end: eventEnd,
      allDay: true,
      recurrence: { frequency: 'YEARLY' },
    };

    const icsCalendar = new ICalendar(config);
    const icsData = icsCalendar.render();
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });

    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', `${person.Title}-birthday.ics`);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
