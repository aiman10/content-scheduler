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
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.getAwards();
  }

  async getAwards() {
    this.awards = await this.databaseService.getAwards();
    console.log(this.awards);
  }
}
