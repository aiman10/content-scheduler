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

  async ngOnInit(): Promise<void> {
    /*
    try {
      // Make an HTTP request to the IMDb page
      const response = await lastValueFrom(
        this.http.get('https://www.imdb.com/name/nm0000206/', {
          responseType: 'text',
        })
      );

      if (typeof response === 'string') {
        // Parse the HTML content using cheerio
        const $ = cheerio.load(response);

        // Extract the actor's name and birthdate (you need to inspect the page's HTML structure)
        this.actorName = $('.header .itemprop').text();
        this.actorBirthdate = $('[itemprop="birthDate"]').text();
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error fetching IMDb data:', error);
    }
    */
  }
}
