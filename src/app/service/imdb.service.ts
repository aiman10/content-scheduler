import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ImdbService {
  constructor(private http: HttpClient) {}

  getActors(month: number, day: number): Promise<Root> {
    const headers = new HttpHeaders({
      //encrypt api key using environment variable
      'X-RapidAPI-Key': environment.apiKey,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com',
    });
    return lastValueFrom(
      this.http.get<Root>(
        `https://imdb8.p.rapidapi.com/actors/list-born-today?month=${month}&day=${day}`,
        { headers }
      )
    );
  }
}

export type Root = string[];
