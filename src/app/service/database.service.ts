import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IFilm } from '../filmresult';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private http: HttpClient) {}

  getAllFilms(): Promise<IFilm[]> {
    return lastValueFrom(
      this.http.get<IFilm[]>('http://localhost:3000/movies')
    );
  }

  async updateFilm(id: string, film: IFilm) {
    await lastValueFrom(
      this.http.put(`http://localhost:3000/movies/${id}`, film)
    );
    await this.getAllFilms();
  }
}
