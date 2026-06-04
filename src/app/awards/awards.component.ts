import { Component, OnInit } from '@angular/core';
import { Award } from '../awards';
import { DatabaseService } from '../service/database.service';
import { ICalendar } from 'datebook';

@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.css'],
})
export class AwardsComponent implements OnInit {
  awards: Award[] = [];
  upcomingAwards: Award[] = [];
  pastAwards: Award[] = [];
  loading = true;

  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.getAwards();
  }

  async getAwards() {
    this.loading = true;
    this.awards = (await this.databaseService.getAwards()) || [];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const dated = this.awards.filter((a) => this.parse(a) !== null);

    this.upcomingAwards = dated
      .filter((a) => (this.parse(a) as Date) >= startOfToday)
      .sort((a, b) => this.time(a) - this.time(b)); // soonest first

    this.pastAwards = dated
      .filter((a) => (this.parse(a) as Date) < startOfToday)
      .sort((a, b) => this.time(b) - this.time(a)); // most recent first

    this.loading = false;
  }

  // ----- Date helpers -----

  /** Parse an award date string into a Date, or null if unparseable. */
  parse(award: Award): Date | null {
    if (!award?.date) return null;
    const d = new Date(award.date);
    return isNaN(d.getTime()) ? null : d;
  }

  private time(award: Award): number {
    const d = this.parse(award);
    return d ? d.getTime() : 0;
  }

  displayDate(award: Award): string {
    const d = this.parse(award);
    if (!d) return award.date || 'Date TBA';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /** Human relative label, e.g. "in 84 days", "today", "3 months ago". */
  relative(award: Award): string {
    const d = this.parse(award);
    if (!d) return '';
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((target.getTime() - start.getTime()) / dayMs);

    if (diffDays === 0) return 'today';
    const ahead = diffDays > 0;
    const days = Math.abs(diffDays);
    let value: string;
    if (days < 31) {
      value = `${days} day${days === 1 ? '' : 's'}`;
    } else if (days < 365) {
      const months = Math.round(days / 30);
      value = `${months} month${months === 1 ? '' : 's'}`;
    } else {
      const years = Math.round(days / 365);
      value = `${years} year${years === 1 ? '' : 's'}`;
    }
    return ahead ? `in ${value}` : `${value} ago`;
  }

  initials(award: Award): string {
    const parts = (award.name || '').trim().split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]).join('');
    return (letters || '?').toUpperCase();
  }

  downloadICSCalendar(award: Award) {
    const eventDate = this.parse(award);
    if (!eventDate) return;
    const eventEnd = new Date(eventDate);
    eventEnd.setDate(eventEnd.getDate() + 1);

    const config = {
      title: award.name,
      description: 'Awards ceremony',
      start: eventDate,
      end: eventEnd,
      allDay: true,
    };

    const icsCalendar = new ICalendar(config);
    const icsData = icsCalendar.render();
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });

    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', `${award.name}.ics`);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
