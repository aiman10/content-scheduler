import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as cheerio from 'cheerio';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'app-actor-calendar',
  templateUrl: './actor-calendar.component.html',
  styleUrls: ['./actor-calendar.component.css'],
})
export class ActorCalendarComponent implements OnInit {
  public actorName: string = '';
  public actorBirthdate: string = '';

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<void> {}
}
