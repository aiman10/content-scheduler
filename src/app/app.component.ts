import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ThemeService } from './service/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'content-cal';

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
    private theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.theme.init();
  }
}
