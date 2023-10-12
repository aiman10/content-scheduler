import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  auth: {
    domain: 'dev-sipsml8vb00v5eww.us.auth0.com',
    clientId: 'mkB7Huc7rbXX8QYZnT2iGTs3jI57gcOl',
    redirectUri: window.location.origin,
  },
  firebase: {
    projectId: 'content-calender-ce797',
    appId: '1:1086888894529:web:2e204a4508661d1233e6c0',
    storageBucket: 'content-calender-ce797.appspot.com',
    apiKey: 'AIzaSyBM5p1YPjSILGhrFBySImycdOJXQtX5MhI',
    authDomain: 'content-calender-ce797.firebaseapp.com',
    messagingSenderId: '1086888894529',
    measurementId: 'G-VLF8FHJC77',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
