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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from '@auth0/auth0-angular';
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
          path: 'castcrew',
          component: CastCrewComponent,
        },
        {
          path: 'castcrew/:date',
          component: CastCrewDetailComponent,
        },
        {
          path: 'awards',
          component: AwardsComponent,
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

  providers: [ScreenTrackingService, UserTrackingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
