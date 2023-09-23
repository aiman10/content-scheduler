import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImdbService {
  constructor(private http: HttpClient) {}

  getActors(month: number, day: number): Promise<Root> {
    const headers = new HttpHeaders({
      'X-RapidAPI-Key': '4789f3c0femshf2725f6d52bbd83p1ee145jsnafd5a39b1aa8',
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
