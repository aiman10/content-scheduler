import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';

export function momentAdapterFactory() {
  return adapterFactory(moment);
};

@NgModule({
  declarations: [AppComponent, CalendarComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, BrowserModule, CalendarModule.forRoot({ provide: DateAdapter, useFactory: momentAdapterFactory })],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
