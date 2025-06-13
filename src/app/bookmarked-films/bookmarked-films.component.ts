import { Component, OnInit } from '@angular/core';
import { IFilm } from '../filmresult';
import { ActivatedRoute } from '@angular/router';
import { BookmarkService } from '../service/bookmarked.service';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { SelectdateService } from '../service/selectdate.service';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from '../service/database.service';
import { ICalendar } from 'datebook';

@Component({
  selector: 'app-bookmarked-films',
  templateUrl: './bookmarked-films.component.html',
  styleUrls: ['./bookmarked-films.component.css'],
})
export class BookmarkedFilmsComponent implements OnInit {
  bookmarkedMovies: IFilm[] = [];
  filterValues: string[] = ['All', 'Bookmarked'];
  selectedValue = 'All';
  isLoading = true;
  selectedYear = new Date().getFullYear();
  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService,
    private bookmarkService: BookmarkService,
    private dateService: SelectdateService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    console.log(this.selectedValue);
    this.getFilms();
    this.sortBookmarkedMoviesByDate();
  }

  async getFilms() {
    this.isLoading = true;
    const allMovies = await this.databaseService.getAllFilms();
    const filteredByYear = allMovies.filter(
      (m) => new Date(m.release_date).getFullYear() === this.selectedYear
    );

    if (this.selectedValue === 'All') {
      this.bookmarkedMovies = filteredByYear;
    } else if (this.selectedValue === 'Bookmarked') {
      this.bookmarkedMovies = filteredByYear.filter((movie) => movie.isBookmarked);
    }

    this.sortBookmarkedMoviesByDate();
    this.isLoading = false;
  }

  sortBookmarkedMoviesByDate() {
    this.bookmarkedMovies.sort((a, b) => {
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);

      // Compare years
      const yearDifference = dateA.getFullYear() - dateB.getFullYear();
      if (yearDifference !== 0) {
        return yearDifference;
      }

      // Compare months if years are equal
      const monthDifference = dateA.getMonth() - dateB.getMonth();
      if (monthDifference !== 0) {
        return monthDifference;
      }

      // Compare days if years and months are equal
      return dateA.getDate() - dateB.getDate();
    });
  }

  toggleBookmark(movie: IFilm) {
    movie.isBookmarked = !movie.isBookmarked;
    //console.log(movie);
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

  previousYear() {
    this.selectedYear--;
    this.getFilms();
  }

  nextYear() {
    this.selectedYear++;
    this.getFilms();
  }

  onFilterChange(): void {
    this.getFilms();
  }
  //add a dropdown list to filter movies on favorites, release year
}
