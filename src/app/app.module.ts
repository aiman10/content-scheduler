import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule, AuthGuard, AuthHttpInterceptor } from '@auth0/auth0-angular';
import { LoginComponent } from './login/login.component';
import { ActorCalendarComponent } from './actor-calendar/actor-calendar.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import {
  provideAnalytics,
  getAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { CastCrewComponent } from './cast-crew/cast-crew.component';
import { CastCrewDetailComponent } from './cast-crew-detail/cast-crew-detail.component';
import { AwardsComponent } from './awards/awards.component';

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
    CastCrewComponent,
    CastCrewDetailComponent,
    AwardsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireModule,
    AuthModule.forRoot({
      domain: 'dev-sipsml8vb00v5eww.us.auth0.com',
      clientId: 'fV4butLWkV6RudKUFqBahesWfwjquf4r',
      authorizationParams: {
        // Audience of the backend API (Auth0 API identifier). Required so the
        // SDK issues a JWT access token the backend can validate — without it
        // Auth0 returns an opaque token and the interceptor won't attach it.
        audience: 'https://api.film-enthusiast',
        redirect_uri: window.location.origin,
      },
      // Attach the access token (Authorization: Bearer) to backend calls.
      httpInterceptor: {
        allowedList: ['https://content-schedule-backend.onrender.com/*'],
      },
    }),
    RouterModule.forRoot(
      [
        {
          path: 'home',
          component: CalendarComponent,
          canActivate: [AuthGuard],
        },
        {
          path: 'detail/:date',
          component: CalendarDetailComponent,
          canActivate: [AuthGuard],
        },
        {
          path: 'bookmarked',
          component: BookmarkedFilmsComponent,
          canActivate: [AuthGuard],
        },
        {
          path: 'actors',
          component: ActorCalendarComponent,
          canActivate: [AuthGuard],
        },
        {
          path: 'castcrew',
          component: CastCrewComponent,
          canActivate: [AuthGuard],
        },
        {
          path: 'castcrew/:date',
          component: CastCrewDetailComponent,
          canActivate: [AuthGuard],
        },
        {
          path: 'awards',
          component: AwardsComponent,
          canActivate: [AuthGuard],
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
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],

  providers: [
    ScreenTrackingService,
    UserTrackingService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
