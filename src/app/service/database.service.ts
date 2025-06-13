import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
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
      this.http.get<IFilm[]>(`${environment.apiBaseUrl}/movies`)
    );
  }

  getFilm(id: string): Promise<IFilm> {
    return lastValueFrom(
      this.http.get<IFilm>(`${environment.apiBaseUrl}/movies/${id}`)
    );
  }

  getFilmByName(name: string): Promise<IFilm> {
    return lastValueFrom(
      this.http.get<IFilm>(`${environment.apiBaseUrl}/movies/name/${name}`)
    );
  }

  async updateFilm(id: string, film: IFilm) {
    await lastValueFrom(
      this.http.put(`${environment.apiBaseUrl}/movies/${id}`, film)
    );
    await this.getAllFilms();
  }

  async createFilm(film: IFilm) {
    await lastValueFrom(this.http.post(`${environment.apiBaseUrl}/movies`, film));
    await this.getAllFilms();
  }

  async getActors() {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${environment.apiBaseUrl}/cast-crew/actors`)
    );
  }

  async getAcresses() {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${environment.apiBaseUrl}/cast-crew/actresses`)
    );
  }

  async getDirectors() {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${environment.apiBaseUrl}/cast-crew/directors`)
    );
  }

  async getComposer() {
    return lastValueFrom(
      this.http.get<CastCrew[]>(`${environment.apiBaseUrl}/cast-crew/composers`)
    );
  }

  async getAwards() {
    return lastValueFrom(
      this.http.get<Award[]>(`${environment.apiBaseUrl}/awards`)
    );
  }
}
