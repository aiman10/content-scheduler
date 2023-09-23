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
import { BookmarkedFilmsComponent } from './bookmarked-films/bookmarked-films.component';

import { AuthModule } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './login/login.component';
import { ActorCalendarComponent } from './actor-calendar/actor-calendar.component';

export function momentAdapterFactory() {
  return adapterFactory(moment);
}

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    CalendarDetailComponent,
    NavbarComponent,
    BookmarkedFilmsComponent,
    LoginComponent,
    ActorCalendarComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserModule,
    AuthModule.forRoot({
      domain: 'dev-sipsml8vb00v5eww.us.auth0.com',
      clientId: 'fV4butLWkV6RudKUFqBahesWfwjquf4r',
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
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
          path: 'bookmarked',
          component: BookmarkedFilmsComponent,
        },
        {
          path: 'actors',
          component: ActorCalendarComponent,
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
