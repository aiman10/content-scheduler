import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
import { CalendarDetailComponent } from './calendar-detail/calendar-detail.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

export function momentAdapterFactory() {
  return adapterFactory(moment);
}

@NgModule({
  declarations: [AppComponent, CalendarComponent, CalendarDetailComponent, NavbarComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserModule,
    //AngularIcalModule,
    RouterModule.forRoot(
      [
        {
          path: 'home',
          component: CalendarComponent,
        },
        {
          path: 'detail/:date',
          component: CalendarDetailComponent,
        },
        {
          path: '',
          redirectTo: 'home',
          pathMatch: 'full',
        },
      ],
      {
        useHash: true,
      }
    ),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: momentAdapterFactory,
    }),
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
