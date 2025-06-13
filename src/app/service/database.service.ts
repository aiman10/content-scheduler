import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IFilm } from '../filmresult';
import { CastCrew } from '../cast-crew';
import { Award } from '../awards';

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

  getFilm(id: string): Promise<IFilm> {
    return lastValueFrom(
      this.http.get<IFilm>(`http://localhost:3000/movies/${id}`)
    );
  }

  getFilmByName(name: string): Promise<IFilm> {
    return lastValueFrom(
      this.http.get<IFilm>(`http://localhost:3000/movies/name/${name}`)
    );
  }

  async updateFilm(id: string, film: IFilm) {
    await lastValueFrom(
      this.http.put(`http://localhost:3000/movies/${id}`, film)
    );
    await this.getAllFilms();
  }

  async createFilm(film: IFilm) {
    await lastValueFrom(this.http.post('http://localhost:3000/movies', film));
    await this.getAllFilms();
  }

  async getActors() {
    return lastValueFrom(
      this.http.get<CastCrew[]>('http://localhost:3000/cast-crew/actors')
    );
  }

  async getAcresses() {
    return lastValueFrom(
      this.http.get<CastCrew[]>('http://localhost:3000/cast-crew/actresses')
    );
  }

  async getDirectors() {
    return lastValueFrom(
      this.http.get<CastCrew[]>('http://localhost:3000/cast-crew/directors')
    );
  }

  async getComposer() {
    return lastValueFrom(
      this.http.get<CastCrew[]>('http://localhost:3000/cast-crew/composers')
    );
  }

  async getAwards() {
    return lastValueFrom(
      this.http.get<Award[]>('http://localhost:3000/awards')
    );
  }
}
