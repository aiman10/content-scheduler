import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SelectdateService {
  selectedDate: Date = new Date();
  constructor() {}
}
