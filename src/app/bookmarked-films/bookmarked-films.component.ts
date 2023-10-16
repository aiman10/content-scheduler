import { Component, OnInit } from '@angular/core';
import { IFilm } from '../filmresult';
import { ActivatedRoute } from '@angular/router';
import { BookmarkService } from '../service/bookmarked.service';
import { MoviedatabaseService } from '../service/moviedatabase.service';
import { SelectdateService } from '../service/selectdate.service';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from '../service/database.service';

@Component({
  selector: 'app-bookmarked-films',
  templateUrl: './bookmarked-films.component.html',
  styleUrls: ['./bookmarked-films.component.css'],
})
export class BookmarkedFilmsComponent implements OnInit {
  bookmarkedMovies: IFilm[] = [];
  isLoading = true;
  constructor(
    private route: ActivatedRoute,
    private movieService: MoviedatabaseService,
    private bookmarkService: BookmarkService,
    private dateService: SelectdateService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.getFilms();
    this.sortBookmarkedMoviesByDate();
  }

  async getFilms() {
    this.bookmarkedMovies = await this.databaseService.getAllFilms();
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
}
