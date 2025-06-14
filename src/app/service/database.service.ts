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
  private readonly baseUrl =
    'https://content-schedule-backend.onrender.com';

  constructor(private http: HttpClient) {}

  getAllFilms(): Promise<IFilm[]> {
    return lastValueFrom(
      this.http.get<IFilm[]>(`${this.baseUrl}/movies`)
    );
  }

  getFilm(id: string): Promise<IFilm> {
    return lastValueFrom(
      this.http.get<IFilm>(`${this.baseUrl}/movies/${id}`)
    );
  }

  getFilmByName(name: string): Promise<IFilm> {
    return lastValueFrom(
      this.http.get<IFilm>(`${this.baseUrl}/movies/name/${name}`)
    );
  }

  async updateFilm(id: string, film: IFilm): Promise<void> {
    await lastValueFrom(
      this.http.put(`${this.baseUrl}/movies/${id}`, film)
    );
    await this.getAllFilms();
  }

  async createFilm(film: IFilm): Promise<void> {
    await lastValueFrom(
      this.http.post(`${this.baseUrl}/movies`, film)
    );
    await this.getAllFilms();
  }

  async getActors(): Promise<CastCrew[]> {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${this.baseUrl}/cast-crew/actors`)
    );
  }

  async getAcresses(): Promise<CastCrew[]> {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${this.baseUrl}/cast-crew/actresses`)
    );
  }

  async getDirectors(): Promise<CastCrew[]> {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${this.baseUrl}/cast-crew/directors`)
    );
  }

  async getComposer(): Promise<CastCrew[]> {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${this.baseUrl}/cast-crew/composers`)
    );
  }

  async getAwards(): Promise<Award[]> {
    return lastValueFrom(
      this.http.get<Award[]>(`${this.baseUrl}/awards`)
    );
  }
}
