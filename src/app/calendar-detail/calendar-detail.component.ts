import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { IFilm, Result } from '../filmresult';

@Component({
  selector: 'app-calendar-detail',
  templateUrl: './calendar-detail.component.html',
  styleUrls: ['./calendar-detail.component.css'],
})
export class CalendarDetailComponent implements OnInit {
  selectedYear!: number;
  years: number[] = Array.from(
    { length: 61 }, // Change the length to cover a larger range of years
    (_, i) => new Date().getFullYear() - 60 + i
  );
  date = '';
  films: IFilm[] = [];
  result!: Result;

  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.date = params['date']; // Access the 'date' parameter
      this.selectedYear = Number(this.date.substring(0, 4));
      this.getFilms(1);
    });
  }
  async getFilms(id: number) {
    this.result = await this.movieService.getFilms(this.date, id);
    this.films = this.result.results.sort((a, b) => {
      return b.popularity - a.popularity;
    });

    //console.log(this.result);
  }

  onDateChange() {
    this.date = this.selectedYear + this.date.substring(4); // Keep the rest of the date as it is
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
}
