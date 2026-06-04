import { Component, OnInit } from '@angular/core';
import { Award } from '../awards';
import { DatabaseService } from '../service/database.service';

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

    // Dates are annual estimates, so classify/sort by month+day within the
    // yearly cycle (ignoring the stored year) rather than an absolute date.
    const now = new Date();
    const todayOrdinal = this.monthDayOrdinal(now.getMonth() + 1, now.getDate());

    const dated = this.awards.filter((a) => this.parse(a) !== null);

    this.upcomingAwards = dated
      .filter((a) => this.ordinal(a) >= todayOrdinal)
      .sort((a, b) => this.ordinal(a) - this.ordinal(b)); // soonest first

    this.pastAwards = dated
      .filter((a) => this.ordinal(a) < todayOrdinal)
      .sort((a, b) => this.ordinal(b) - this.ordinal(a)); // most recent first

    this.loading = false;
  }

  // ----- Date helpers -----

  /** Parse an award date string into a Date, or null if unparseable. */
  parse(award: Award): Date | null {
    if (!award?.date) return null;
    const d = new Date(award.date);
    return isNaN(d.getTime()) ? null : d;
  }

  private monthDayOrdinal(month: number, day: number): number {
    return month * 100 + day;
  }

  /** Month+day ordinal of an award (year-agnostic), used for ordering. */
  private ordinal(award: Award): number {
    const d = this.parse(award);
    return d ? this.monthDayOrdinal(d.getMonth() + 1, d.getDate()) : 0;
  }

  /** Estimated ceremony date as month + day only (no year). */
  displayDate(award: Award): string {
    const d = this.parse(award);
    if (!d) return award.date || 'Date TBA';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  initials(award: Award): string {
    const parts = (award.name || '').trim().split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]).join('');
    return (letters || '?').toUpperCase();
  }
}
