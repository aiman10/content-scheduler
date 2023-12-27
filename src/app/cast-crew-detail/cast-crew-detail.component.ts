import { Component, OnInit } from '@angular/core';
import { CastCrew } from '../cast-crew';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../service/bookmarked.service';
import { DatabaseService } from '../service/database.service';
import { SelectdateService } from '../service/selectdate.service';

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
  age = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: BookmarkService,
    private dateService: SelectdateService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.getCastCrew();
  }

  calculateAge(birthday: string) {
    const birthDate = new Date(birthday);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  async getCastCrew() {
    this.actors = await this.databaseService.getActors();
    this.actresses = await this.databaseService.getAcresses();
    this.directors = await this.databaseService.getDirectors();
    this.composers = await this.databaseService.getComposer();
    //add to all to allcastCrew
    this.allcastCrew = this.allcastCrew.concat(this.actors);
    this.allcastCrew = this.allcastCrew.concat(this.actresses);
    this.allcastCrew = this.allcastCrew.concat(this.directors);
    this.allcastCrew = this.allcastCrew.concat(this.composers);
    //remove duplicates from allcastCrew
    this.allcastCrew = this.allcastCrew.filter(
      (thing, index, self) =>
        index === self.findIndex((t) => t.Title === thing.Title)
    );
    //filter by date
    this.route.params.subscribe((params) => {
      this.date = params['date']; // Access the 'date' parameter
      const selectedMonthDay = this.date.substring(5);
      //console.log(selectedMonthDay);
      this.allcastCrew = this.allcastCrew.filter((castCrew) => {
        const movieMonthDay = castCrew.Birthday.substring(5);
        return movieMonthDay === selectedMonthDay;
      });
    });
  }

  findType(castCrew: CastCrew) {
    if (this.actors.includes(castCrew)) {
      return 'Actor';
    } else if (this.actresses.includes(castCrew)) {
      return 'Actress';
    } else if (this.directors.includes(castCrew)) {
      return 'Director';
    } else if (this.composers.includes(castCrew)) {
      return 'Composer';
    }
    return 'Unknown';
  }

  downloadICSCalendar(CastCrew: CastCrew) {}
}
