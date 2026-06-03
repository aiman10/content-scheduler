import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'fe-theme';
  current: Theme = 'light';

  init(): void {
    const saved = localStorage.getItem(this.key);
    this.current = saved === 'dark' ? 'dark' : 'light';
    this.apply();
  }

  setTheme(theme: Theme): void {
    this.current = theme;
    localStorage.setItem(this.key, theme);
    this.apply();
  }

  toggle(): void {
    this.setTheme(this.current === 'light' ? 'dark' : 'light');
  }

  private apply(): void {
    document.documentElement.setAttribute('data-theme', this.current);
  }
}
