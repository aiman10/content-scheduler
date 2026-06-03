# Calendar Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Film Enthusiast home screen (nav shell + calendar month view) to the "Modern Minimal" design, with a shared design-token/theme foundation and all controls wired to real bookmarked-film data.

**Architecture:** Layer CSS custom-property design tokens (light/dark, switched via `<html data-theme>`) on top of the existing Bulma app. A `ThemeService` owns theme state + persistence. Pure helper modules (`genres.ts`, `film-filter.ts`) hold testable logic; the `navbar` and `calendar` components are rebuilt to use only the new tokens. No backend, routing-table, or data-model changes.

**Tech Stack:** Angular 14, TypeScript, Karma + Jasmine (ChromeHeadless), CSS custom properties, Google Fonts (Newsreader / Inter / JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-06-03-calendar-home-redesign-design.md`

---

## File Structure

**New files**
- `src/app/genres.ts` — TMDB genre-id → bucket name + oklch dot color (pure).
- `src/app/genres.spec.ts` — tests for the above.
- `src/app/calendar/film-filter.ts` — `CalendarFilters`, `DEFAULT_FILTERS`, `applyFilters` (pure).
- `src/app/calendar/film-filter.spec.ts` — tests.
- `src/app/service/theme.service.ts` — theme state, persistence, `<html data-theme>`.
- `src/app/service/theme.service.spec.ts` — tests.

**Modified files**
- `src/index.html` — fonts + pre-paint theme script + title.
- `src/styles.css` — design tokens, base typography, transitions.
- `src/app/app.component.ts` — initialise `ThemeService` on startup.
- `src/app/navbar/navbar.component.{html,css,ts}` — redesigned shell.
- `src/app/calendar/calendar.component.{html,css,ts}` — redesigned month view + filters + restyled week view.

**Test commands**
- Unit: `npm test -- --watch=false --browsers=ChromeHeadless`
- Build: `npm run build`

---

## Task 1: Genre map & dot colors

**Files:**
- Create: `src/app/genres.ts`
- Test: `src/app/genres.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/genres.spec.ts
import { IFilm } from './filmresult';
import { genreBucket, genreName, genreColor } from './genres';

function film(genre_ids: number[]): IFilm {
  return {
    adult: false, genre_ids, id: 1, original_language: 'en',
    original_title: '', overview: '', popularity: 0, poster_path: '',
    release_date: '2026-06-05', title: '', video: false,
    vote_average: 0, vote_count: 0,
  };
}

describe('genres', () => {
  it('maps a known TMDB id to its bucket name', () => {
    expect(genreBucket(film([27]))).toBe('Horror');        // 27 = Horror
    expect(genreBucket(film([878]))).toBe('Sci-Fi');       // 878 = Science Fiction
    expect(genreBucket(film([35, 18]))).toBe('Comedy');    // first known id wins
  });

  it('falls back to Drama for unknown/empty ids', () => {
    expect(genreBucket(film([]))).toBe('Drama');
    expect(genreBucket(film([999999]))).toBe('Drama');
  });

  it('exposes the bucket name via genreName', () => {
    expect(genreName(film([28]))).toBe('Action');
  });

  it('returns an oklch color, brighter in dark mode', () => {
    expect(genreColor(film([28]), false)).toBe('oklch(0.62 0.16 12)');
    expect(genreColor(film([28]), true)).toBe('oklch(0.68 0.16 12)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --browsers=ChromeHeadless --include='**/genres.spec.ts'`
Expected: FAIL — cannot find module `./genres`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/app/genres.ts
import { IFilm } from './filmresult';

export type GenreBucket =
  | 'Action' | 'Comedy' | 'Drama' | 'Romance'
  | 'Horror' | 'Sci-Fi' | 'Family' | 'Classic';

// Hue per README; chroma fixed at 0.16; lightness 0.62 light / 0.68 dark.
const BUCKET_HUE: Record<GenreBucket, number> = {
  Action: 12, Comedy: 50, Drama: 270, Romance: 350,
  Horror: 150, 'Sci-Fi': 220, Family: 180, Classic: 80,
};

// TMDB movie genre id -> design bucket (nearest reasonable hue for the long tail).
const TMDB_TO_BUCKET: Record<number, GenreBucket> = {
  28: 'Action', 12: 'Action', 53: 'Action', 80: 'Action', 10752: 'Action',
  35: 'Comedy', 10402: 'Comedy', 10770: 'Comedy',
  18: 'Drama', 36: 'Drama', 9648: 'Drama',
  10749: 'Romance',
  27: 'Horror',
  878: 'Sci-Fi', 14: 'Sci-Fi',
  10751: 'Family', 16: 'Family',
  99: 'Classic', 37: 'Classic',
};

export function genreBucket(film: IFilm): GenreBucket {
  for (const id of film.genre_ids || []) {
    const bucket = TMDB_TO_BUCKET[id];
    if (bucket) return bucket;
  }
  return 'Drama';
}

export function genreName(film: IFilm): string {
  return genreBucket(film);
}

export function genreColor(film: IFilm, isDark: boolean): string {
  const lightness = isDark ? 0.68 : 0.62;
  return `oklch(${lightness} 0.16 ${BUCKET_HUE[genreBucket(film)]})`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --browsers=ChromeHeadless --include='**/genres.spec.ts'`
Expected: PASS (4 specs).

- [ ] **Step 5: Commit**

```bash
git add src/app/genres.ts src/app/genres.spec.ts
git commit -m "feat: add genre bucket + oklch dot color map"
```

---

## Task 2: Calendar filter functions

**Files:**
- Create: `src/app/calendar/film-filter.ts`
- Test: `src/app/calendar/film-filter.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/calendar/film-filter.spec.ts
import { IFilm } from '../filmresult';
import { applyFilters, DEFAULT_FILTERS, CalendarFilters } from './film-filter';

function film(over: Partial<IFilm>): IFilm {
  return {
    adult: false, genre_ids: [18], id: 1, original_language: 'en',
    original_title: '', overview: '', popularity: 0, poster_path: '',
    release_date: '1994-06-05', title: 'x', video: false,
    vote_average: 7.5, vote_count: 0, isBookmarked: true, ...over,
  };
}

describe('applyFilters', () => {
  const films = [
    film({ id: 1, genre_ids: [27], vote_average: 6.0, release_date: '1980-06-01', isBookmarked: true }),
    film({ id: 2, genre_ids: [878], vote_average: 8.2, release_date: '1999-06-02', isBookmarked: false }),
    film({ id: 3, genre_ids: [35], vote_average: 7.1, release_date: '2010-06-03', isBookmarked: true }),
  ];

  it('returns everything with default filters', () => {
    expect(applyFilters(films, DEFAULT_FILTERS).length).toBe(3);
  });

  it('filters by genre bucket', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, genre: 'Sci-Fi' };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([2]);
  });

  it('filters by minimum rating', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, minRating: 7 };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([2, 3]);
  });

  it('filters by decade', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, decade: 1990 };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([2]);
  });

  it('filters bookmarked only', () => {
    const f: CalendarFilters = { ...DEFAULT_FILTERS, bookmarkedOnly: true };
    expect(applyFilters(films, f).map((x) => x.id)).toEqual([1, 3]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --browsers=ChromeHeadless --include='**/film-filter.spec.ts'`
Expected: FAIL — cannot find module `./film-filter`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/app/calendar/film-filter.ts
import { IFilm } from '../filmresult';
import { genreBucket, GenreBucket } from '../genres';

export interface CalendarFilters {
  genre: GenreBucket | null; // null = All
  minRating: number;         // 0 = All
  decade: number | null;     // e.g. 1990; null = All
  bookmarkedOnly: boolean;
}

export const DEFAULT_FILTERS: CalendarFilters = {
  genre: null,
  minRating: 0,
  decade: null,
  bookmarkedOnly: false,
};

export function applyFilters(films: IFilm[], f: CalendarFilters): IFilm[] {
  return films.filter((film) => {
    if (f.genre && genreBucket(film) !== f.genre) return false;
    if (f.minRating && (film.vote_average || 0) < f.minRating) return false;
    if (f.decade != null) {
      const year = Number((film.release_date || '0').slice(0, 4));
      if (Math.floor(year / 10) * 10 !== f.decade) return false;
    }
    if (f.bookmarkedOnly && !film.isBookmarked) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --browsers=ChromeHeadless --include='**/film-filter.spec.ts'`
Expected: PASS (5 specs).

- [ ] **Step 5: Commit**

```bash
git add src/app/calendar/film-filter.ts src/app/calendar/film-filter.spec.ts
git commit -m "feat: add calendar film-filter functions"
```

---

## Task 3: ThemeService

**Files:**
- Create: `src/app/service/theme.service.ts`
- Test: `src/app/service/theme.service.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/service/theme.service.spec.ts
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let svc: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    svc = new ThemeService();
  });

  it('defaults to light and applies the attribute on init', () => {
    svc.init();
    expect(svc.current).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('reads a persisted dark theme on init', () => {
    localStorage.setItem('fe-theme', 'dark');
    svc.init();
    expect(svc.current).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle flips theme, persists it, and updates the attribute', () => {
    svc.init();
    svc.toggle();
    expect(svc.current).toBe('dark');
    expect(localStorage.getItem('fe-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --browsers=ChromeHeadless --include='**/theme.service.spec.ts'`
Expected: FAIL — cannot find module `./theme.service`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/app/service/theme.service.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --browsers=ChromeHeadless --include='**/theme.service.spec.ts'`
Expected: PASS (3 specs).

- [ ] **Step 5: Commit**

```bash
git add src/app/service/theme.service.ts src/app/service/theme.service.spec.ts
git commit -m "feat: add ThemeService with localStorage persistence"
```

---

## Task 4: Global design tokens + fonts

**Files:**
- Modify: `src/index.html`
- Modify: `src/styles.css`

- [ ] **Step 1: Add fonts + pre-paint theme script to `index.html`**

In `src/index.html` `<head>`, after the favicon `<link>`, add:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
  rel="stylesheet"
/>
<script>
  (function () {
    var t = localStorage.getItem('fe-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

Also change `<title>ContentCal</title>` to `<title>Film Enthusiast</title>`.

- [ ] **Step 2: Append design tokens to `styles.css`**

Append to `src/styles.css`:

```css
/* ===== Modern Minimal design tokens ===== */
:root[data-theme='light'] {
  --bg: #faf8f4;
  --surface: #ffffff;
  --elev: #fdfbf7;
  --border: #e8e2d6;
  --border-strong: #d6cdbb;
  --text: #1a1815;
  --text-muted: #5c544a;
  --muted: #a09689;
  --red: #b53428;
  --red-ink: #8c2a21;
  --red-soft: #fbedea;
}

:root[data-theme='dark'] {
  --bg: #141210;
  --surface: #1c1916;
  --elev: #221e1a;
  --border: #2e2a24;
  --border-strong: #3b362e;
  --text: #f1e9dd;
  --text-muted: #a89e8e;
  --muted: #6e6557;
  --red: #e04a3a;
  --red-ink: #f26a5a;
  --red-soft: rgba(224, 74, 58, 0.13);
}

:root {
  --font-serif: 'Newsreader', Georgia, serif;
  --font-ui: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --nav-height: 72px;
  --page-x: 48px;
  --card-radius: 12px;
  --chip-radius: 999px;
  --cell-min-h: 132px;
}

html[data-theme] body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
}

html[data-theme] body,
html[data-theme] body * {
  transition: background-color 200ms ease, color 200ms ease,
    border-color 200ms ease;
}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.html src/styles.css
git commit -m "feat: add design tokens, Google Fonts, pre-paint theme script"
```

---

## Task 5: Initialise ThemeService at startup

**Files:**
- Modify: `src/app/app.component.ts`

- [ ] **Step 1: Inject and init ThemeService**

Replace the contents of `src/app/app.component.ts` with:

```typescript
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
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/app.component.ts
git commit -m "feat: initialise ThemeService on app startup"
```

---

## Task 6: Redesign the nav shell

**Files:**
- Modify: `src/app/navbar/navbar.component.ts`
- Modify: `src/app/navbar/navbar.component.html`
- Modify: `src/app/navbar/navbar.component.css`

- [ ] **Step 1: Add theme toggle + initials to the component**

In `src/app/navbar/navbar.component.ts`:
- Add import: `import { ThemeService } from '../service/theme.service';`
- Add `public theme: ThemeService` to the constructor parameters.
- Add these members to the class body:

```typescript
initials(user: any): string {
  const source: string = user?.name || user?.email || '';
  const parts = source.trim().split(/[\s@.]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p: string) => p[0]).join('');
  return (letters || '?').toUpperCase();
}
```

- [ ] **Step 2: Replace the nav template**

Replace the entire contents of `src/app/navbar/navbar.component.html` with:

```html
<nav class="fe-nav">
  <div class="fe-nav__left">
    <a class="fe-nav__logo" [routerLink]="['home']">
      <img src="../../assets/Transparant profile_Tekengebied 1 - Copy.png" alt="Film Enthusiast" />
    </a>
    <div class="fe-nav__divider"></div>
    <div class="fe-nav__links">
      <a [routerLink]="['home']" routerLinkActive="is-active" class="fe-nav__link">Calendar</a>
      <a class="fe-nav__link is-placeholder">Movies</a>
      <a [routerLink]="['castcrew']" routerLinkActive="is-active" class="fe-nav__link">Cast &amp; Crew</a>
      <a [routerLink]="['bookmarked']" routerLinkActive="is-active" class="fe-nav__link">Bookmarked</a>
      <a [routerLink]="['awards']" routerLinkActive="is-active" class="fe-nav__link">Awards</a>
    </div>
  </div>

  <div class="fe-nav__right">
    <div class="fe-search">
      <i class="fas fa-search fe-search__icon"></i>
      <input
        class="fe-search__input"
        type="text"
        placeholder="Search films, people, awards"
        (input)="onSearch($event)"
        #searchInput
      />
      <span class="fe-search__kbd">⌘K</span>

      <div class="fe-search__results" *ngIf="showDropdown" #dropdownMenu>
        <div *ngFor="let movie of filmResult" class="fe-result">
          <img class="fe-result__img" [src]="imageUrl + movie.poster_path" alt="" />
          <div class="fe-result__meta">
            <div class="fe-result__title">{{ movie.title }}</div>
            <div class="fe-result__year">{{ movie.release_date }}</div>
          </div>
          <button class="fe-result__bm" (click)="toggleBookmark(movie)">
            <i class="fa-solid fa-bookmark" *ngIf="movie.isBookmarked"></i>
            <i class="fa-regular fa-bookmark" *ngIf="!movie.isBookmarked"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="fe-theme-toggle">
      <button
        class="fe-theme-toggle__seg"
        [class.is-active]="theme.current === 'light'"
        (click)="theme.setTheme('light')"
        aria-label="Light mode"
      >☀</button>
      <button
        class="fe-theme-toggle__seg"
        [class.is-active]="theme.current === 'dark'"
        (click)="theme.setTheme('dark')"
        aria-label="Dark mode"
      >☾</button>
    </div>

    <ng-container *ngIf="auth.user$ | async as user">
      <button class="fe-avatar" (click)="auth.logout()" [title]="'Log out ' + (user.name || '')">
        {{ initials(user) }}
      </button>
    </ng-container>
  </div>
</nav>
```

- [ ] **Step 3: Replace the nav styles**

Replace the entire contents of `src/app/navbar/navbar.component.css` with:

```css
.fe-nav {
  height: var(--nav-height);
  padding: 0 40px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fe-nav__left,
.fe-nav__right {
  display: flex;
  align-items: center;
}

.fe-nav__logo img {
  height: 38px;
  width: auto;
  display: block;
}

:root[data-theme='dark'] .fe-nav__logo img {
  filter: invert(1);
}

.fe-nav__divider {
  width: 1px;
  height: 32px;
  background: var(--border);
  margin: 0 32px;
}

.fe-nav__links {
  display: flex;
  gap: 28px;
}

.fe-nav__link {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  padding: 26px 2px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.fe-nav__link:hover {
  color: var(--text);
}

.fe-nav__link.is-active {
  color: var(--text);
  border-bottom-color: var(--red);
}

.fe-nav__link.is-placeholder {
  cursor: default;
}

.fe-nav__right {
  gap: 16px;
}

.fe-search {
  position: relative;
  width: 280px;
}

.fe-search__icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--muted);
}

.fe-search__input {
  width: 100%;
  height: 38px;
  padding: 0 40px 0 34px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text);
}

.fe-search__input::placeholder {
  color: var(--muted);
}

.fe-search__input:focus {
  outline: none;
  border-color: var(--border-strong);
}

.fe-search__kbd {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}

.fe-search__results {
  position: absolute;
  top: 46px;
  right: 0;
  width: 360px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: 6px;
  z-index: 20;
  max-height: 60vh;
  overflow-y: auto;
}

.fe-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
}

.fe-result:hover {
  background: var(--bg);
}

.fe-result__img {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  background: var(--bg);
}

.fe-result__meta {
  flex: 1;
  min-width: 0;
}

.fe-result__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fe-result__year {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}

.fe-result__bm {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
}

.fe-theme-toggle {
  display: flex;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.fe-theme-toggle__seg {
  border: none;
  background: transparent;
  color: var(--muted);
  width: 28px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.fe-theme-toggle__seg.is-active {
  background: var(--surface);
  color: var(--text);
}

.fe-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/navbar
git commit -m "feat: redesign nav shell to Modern Minimal"
```

---

## Task 7: Calendar component logic (filters, counts, helpers)

**Files:**
- Modify: `src/app/calendar/calendar.component.ts`

- [ ] **Step 1: Add imports and filter state**

In `src/app/calendar/calendar.component.ts`, add imports near the top:

```typescript
import { ThemeService } from '../service/theme.service';
import { genreColor, genreBucket, GenreBucket } from '../genres';
import {
  CalendarFilters,
  DEFAULT_FILTERS,
  applyFilters,
} from './film-filter';
```

Add `public theme: ThemeService` as the last constructor parameter.

Add these members to the class body:

```typescript
filters: CalendarFilters = { ...DEFAULT_FILTERS };
openChip: 'genre' | 'rating' | 'decade' | 'bookmarks' | null = null;
displayMovies: IFilm[] = [];
ratingOptions = [
  { label: 'All', value: 0 },
  { label: '≥ 6.0', value: 6 },
  { label: '≥ 7.0', value: 7 },
  { label: '≥ 8.0', value: 8 },
];

private refreshDisplay(): void {
  this.displayMovies = applyFilters(this.bookmarkedMovies, this.filters);
}

toggleChip(chip: 'genre' | 'rating' | 'decade' | 'bookmarks'): void {
  this.openChip = this.openChip === chip ? null : chip;
}

setGenre(g: GenreBucket | null): void {
  this.filters.genre = g;
  this.openChip = null;
  this.refreshDisplay();
}

setRating(v: number): void {
  this.filters.minRating = v;
  this.openChip = null;
  this.refreshDisplay();
}

setDecade(d: number | null): void {
  this.filters.decade = d;
  this.openChip = null;
  this.refreshDisplay();
}

setBookmarks(only: boolean): void {
  this.filters.bookmarkedOnly = only;
  this.openChip = null;
  this.refreshDisplay();
}

clearFilters(): void {
  this.filters = { ...DEFAULT_FILTERS };
  this.openChip = null;
  this.refreshDisplay();
}

get hasActiveFilters(): boolean {
  return (
    this.filters.genre !== null ||
    this.filters.minRating !== 0 ||
    this.filters.decade !== null ||
    this.filters.bookmarkedOnly
  );
}

availableGenres(): GenreBucket[] {
  const set = new Set<GenreBucket>();
  this.bookmarkedMovies.forEach((m) => set.add(genreBucket(m)));
  return Array.from(set).sort();
}

availableDecades(): number[] {
  const set = new Set<number>();
  this.bookmarkedMovies.forEach((m) => {
    const year = Number((m.release_date || '0').slice(0, 4));
    if (year) set.add(Math.floor(year / 10) * 10);
  });
  return Array.from(set).sort((a, b) => b - a);
}

get ratingLabel(): string {
  const opt = this.ratingOptions.find((o) => o.value === this.filters.minRating);
  return opt ? opt.label : 'All';
}

get monthFilms(): IFilm[] {
  return this.displayMovies.filter(
    (m) => Number(m.release_date.slice(5, 7)) === this.selectedMonth + 1
  );
}

get releaseCount(): number {
  return this.monthFilms.length;
}

get anniversaryCount(): number {
  return this.monthFilms.filter((m) => m.isBookmarked).length;
}

pillColor(movie: IFilm): string {
  return genreColor(movie, this.theme.current === 'dark');
}

previousMonth(): void {
  if (this.selectedMonth === 0) {
    this.selectedMonth = 11;
    this.selectedYear--;
  } else {
    this.selectedMonth--;
  }
  this.generateMonthCalendar();
}

nextMonth(): void {
  if (this.selectedMonth === 11) {
    this.selectedMonth = 0;
    this.selectedYear++;
  } else {
    this.selectedMonth++;
  }
  this.generateMonthCalendar();
}

goToToday(): void {
  const now = new Date();
  this.selectedMonth = now.getMonth();
  this.selectedYear = now.getFullYear();
  this.generateMonthCalendar();
}

goToDayView(): void {
  this.dateService.selectedDate = this.selectedDate;
  this.router.navigate(['/detail/', this.formatDateToISO(this.selectedDate)]);
}
```

- [ ] **Step 2: Refresh display data after films load and filter the day helpers**

In `getFilms()`, after `this.loading = false;`, add:

```typescript
this.refreshDisplay();
```

Replace `this.bookmarkedMovies` with `this.displayMovies` in the three day helpers so filters take effect — in `getMoviesForDay`, `getMoviesForWeek`, `getMovieCountForDay`, and `getFullMoviesForDay`. For example `getMoviesForDay` becomes:

```typescript
getMoviesForDay(day: number): any[] {
  const dayStr = this.formatDate(day);
  const moviesForDay = this.displayMovies
    .filter((movie) => movie.release_date.slice(5) === dayStr)
    .sort((a, b) => (b.isBookmarked ? 1 : -1) - (a.isBookmarked ? 1 : -1));
  return moviesForDay.slice(0, 3);
}
```

Apply the same `this.bookmarkedMovies` → `this.displayMovies` swap in `getMoviesForWeek`, `getMovieCountForDay`, and `getFullMoviesForDay`.

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/calendar/calendar.component.ts
git commit -m "feat: add calendar filters, counts, and month navigation logic"
```

---

## Task 8: Calendar month-view template

**Files:**
- Modify: `src/app/calendar/calendar.component.html`

- [ ] **Step 1: Replace the template**

Replace the entire contents of `src/app/calendar/calendar.component.html` with:

```html
<div *ngIf="loading" class="loading-animation">
  <div class="spinner"></div>
</div>

<div *ngIf="!loading" class="fe-cal">
  <!-- Title row -->
  <header class="fe-cal__title">
    <div class="fe-cal__title-left">
      <div class="fe-eyebrow">RELEASE CALENDAR</div>
      <h1 class="fe-h1">
        {{ months[selectedMonth] }} <i>{{ selectedYear }}</i>
      </h1>
      <p class="fe-subtitle">
        {{ releaseCount }} releases · {{ anniversaryCount }} anniversaries you've bookmarked
      </p>
    </div>

    <div class="fe-cal__controls">
      <button class="fe-iconbtn" (click)="previousMonth()" aria-label="Previous month">‹</button>
      <button class="fe-textbtn" (click)="goToToday()">Today</button>
      <button class="fe-iconbtn" (click)="nextMonth()" aria-label="Next month">›</button>
      <div class="fe-vdivider"></div>
      <div class="fe-segment">
        <button class="fe-segment__seg" [class.is-active]="selectedView === 'Month'" (click)="selectedView = 'Month'">Month</button>
        <button class="fe-segment__seg" [class.is-active]="selectedView === 'Week'" (click)="selectedView = 'Week'">Week</button>
        <button class="fe-segment__seg" (click)="goToDayView()">Day</button>
      </div>
    </div>
  </header>

  <!-- Filter chips -->
  <div class="fe-filters">
    <div class="fe-chip-wrap">
      <button class="fe-chip" [class.is-active]="filters.genre" (click)="toggleChip('genre')">
        Genre: {{ filters.genre || 'All' }} <span class="fe-chip__caret">⌄</span>
      </button>
      <div class="fe-menu" *ngIf="openChip === 'genre'">
        <button class="fe-menu__item" (click)="setGenre(null)">All</button>
        <button class="fe-menu__item" *ngFor="let g of availableGenres()" (click)="setGenre(g)">{{ g }}</button>
      </div>
    </div>

    <div class="fe-chip-wrap">
      <button class="fe-chip" [class.is-active]="filters.minRating" (click)="toggleChip('rating')">
        Rating: {{ ratingLabel }} <span class="fe-chip__caret">⌄</span>
      </button>
      <div class="fe-menu" *ngIf="openChip === 'rating'">
        <button class="fe-menu__item" *ngFor="let o of ratingOptions" (click)="setRating(o.value)">{{ o.label }}</button>
      </div>
    </div>

    <div class="fe-chip-wrap">
      <button class="fe-chip" [class.is-active]="filters.decade" (click)="toggleChip('decade')">
        Decade: {{ filters.decade ? filters.decade + 's' : 'All' }} <span class="fe-chip__caret">⌄</span>
      </button>
      <div class="fe-menu" *ngIf="openChip === 'decade'">
        <button class="fe-menu__item" (click)="setDecade(null)">All</button>
        <button class="fe-menu__item" *ngFor="let d of availableDecades()" (click)="setDecade(d)">{{ d }}s</button>
      </div>
    </div>

    <div class="fe-chip-wrap">
      <button class="fe-chip" [class.is-active]="filters.bookmarkedOnly" (click)="toggleChip('bookmarks')">
        Bookmarks: {{ filters.bookmarkedOnly ? 'Bookmarked only' : 'Show all' }} <span class="fe-chip__caret">⌄</span>
      </button>
      <div class="fe-menu" *ngIf="openChip === 'bookmarks'">
        <button class="fe-menu__item" (click)="setBookmarks(false)">Show all</button>
        <button class="fe-menu__item" (click)="setBookmarks(true)">Bookmarked only</button>
      </div>
    </div>

    <button class="fe-clear" *ngIf="hasActiveFilters" (click)="clearFilters()">Clear filters</button>
  </div>

  <!-- Calendar grid -->
  <div class="fe-grid-card">
    <div class="fe-grid fe-grid--head">
      <div class="fe-dayhead">MONDAY</div>
      <div class="fe-dayhead">TUESDAY</div>
      <div class="fe-dayhead">WEDNESDAY</div>
      <div class="fe-dayhead">THURSDAY</div>
      <div class="fe-dayhead">FRIDAY</div>
      <div class="fe-dayhead fe-dayhead--wknd">SATURDAY</div>
      <div class="fe-dayhead fe-dayhead--wknd">SUNDAY</div>
    </div>

    <div *ngIf="selectedView === 'Month'">
      <div class="fe-grid" *ngFor="let week of weeks">
        <div
          class="fe-cell"
          *ngFor="let day of week"
          [class.is-empty]="day === 0"
          [class.is-today]="isToday(day)"
          (click)="day !== 0 && onDayClick(day)"
        >
          <ng-container *ngIf="day !== 0">
            <div class="fe-cell__date">{{ day }}</div>
            <div class="fe-pill" *ngFor="let movie of getMoviesForDay(day)">
              <span class="fe-pill__bar" [style.background]="pillColor(movie)"></span>
              <span class="fe-pill__title">{{ movie.title }}</span>
            </div>
            <div class="fe-more" *ngIf="getMovieCountForDay(day) >= 1">
              +{{ getMovieCountForDay(day) }} more
            </div>
          </ng-container>
        </div>
      </div>
    </div>

    <div *ngIf="selectedView === 'Week'" class="fe-week">
      <div class="fe-week__nav">
        <button class="fe-iconbtn" (click)="previousWeek()" aria-label="Previous week">‹</button>
        <button class="fe-iconbtn" (click)="nextWeek()" aria-label="Next week">›</button>
      </div>
      <div class="fe-grid">
        <div
          class="fe-cell fe-cell--week"
          *ngFor="let day of weeks[0]"
          (click)="day !== 0 && onDayClick(day)"
        >
          <ng-container *ngIf="day !== 0">
            <div class="fe-cell__date">{{ day }}</div>
            <div class="fe-pill" *ngFor="let movie of getMoviesForWeek(day)">
              <span class="fe-pill__bar" [style.background]="pillColor(movie)"></span>
              <span class="fe-pill__title">{{ movie.title }}</span>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/calendar/calendar.component.html
git commit -m "feat: rebuild calendar month-view template"
```

---

## Task 9: Calendar styles

**Files:**
- Modify: `src/app/calendar/calendar.component.css`

- [ ] **Step 1: Replace the stylesheet**

Replace the entire contents of `src/app/calendar/calendar.component.css` with:

```css
.fe-cal {
  font-family: var(--font-ui);
}

/* Title row */
.fe-cal__title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 40px var(--page-x) 24px;
}

.fe-eyebrow {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.fe-h1 {
  font-family: var(--font-serif);
  font-size: 60px;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 6px 0 8px;
  color: var(--text);
}

.fe-h1 i {
  font-style: italic;
  color: var(--red);
}

.fe-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.fe-cal__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fe-iconbtn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.fe-textbtn {
  height: 34px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 13px;
  cursor: pointer;
}

.fe-iconbtn:hover,
.fe-textbtn:hover {
  border-color: var(--border-strong);
}

.fe-vdivider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 4px;
}

.fe-segment {
  display: flex;
  background: var(--elev);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3px;
}

.fe-segment__seg {
  border: none;
  background: transparent;
  color: var(--muted);
  padding: 6px 14px;
  border-radius: 6px;
  font-family: var(--font-ui);
  font-size: 13px;
  cursor: pointer;
}

.fe-segment__seg.is-active {
  background: var(--bg);
  color: var(--text);
}

/* Filter chips */
.fe-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 var(--page-x) 20px;
}

.fe-chip-wrap {
  position: relative;
}

.fe-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: var(--chip-radius);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.fe-chip.is-active {
  background: var(--red-soft);
  border-color: var(--red);
  color: var(--red-ink);
}

.fe-chip__caret {
  font-size: 10px;
  color: var(--muted);
}

.fe-menu {
  position: absolute;
  top: 38px;
  left: 0;
  min-width: 160px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: 4px;
  z-index: 30;
}

.fe-menu__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
}

.fe-menu__item:hover {
  background: var(--bg);
}

.fe-clear {
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--font-ui);
  font-size: 12px;
  cursor: pointer;
}

.fe-clear:hover {
  color: var(--text-muted);
}

/* Grid */
.fe-grid-card {
  margin: 0 var(--page-x) 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  overflow: hidden;
}

.fe-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.fe-grid--head {
  background: var(--elev);
  border-bottom: 1px solid var(--border);
}

.fe-dayhead {
  padding: 12px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  border-right: 1px solid var(--border);
}

.fe-dayhead:last-child {
  border-right: none;
}

.fe-dayhead--wknd {
  color: var(--red);
}

.fe-cell {
  min-height: var(--cell-min-h);
  padding: 12px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  overflow: hidden;
}

.fe-cell:nth-child(7n) {
  border-right: none;
}

.fe-cell:hover {
  background: var(--elev);
}

.fe-cell.is-empty {
  opacity: 0.45;
  cursor: default;
  background: var(--bg);
}

.fe-cell.is-today {
  background: var(--red-soft);
}

.fe-cell__date {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.fe-cell.is-today .fe-cell__date {
  color: var(--red);
}

.fe-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
}

.fe-pill__bar {
  flex: none;
  width: 3px;
  height: 14px;
  border-radius: 1px;
}

.fe-pill__title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fe-more {
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  margin-top: 3px;
}

/* Week view */
.fe-week {
  position: relative;
}

.fe-week__nav {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.fe-cell--week {
  min-height: 420px;
}

/* Loading spinner */
.loading-animation {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg);
}

.spinner {
  border: 6px solid var(--border);
  border-top: 6px solid var(--red);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .fe-cal__title {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px 20px 16px;
  }
  .fe-filters,
  .fe-grid-card {
    padding-left: 20px;
    padding-right: 20px;
  }
  .fe-grid-card {
    margin-left: 0;
    margin-right: 0;
  }
  .fe-cell {
    min-height: 96px;
  }
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/calendar/calendar.component.css
git commit -m "feat: style redesigned calendar month + week views"
```

---

## Task 10: Manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the unit suite**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: all specs pass (genres, film-filter, theme.service, plus any existing specs).

- [ ] **Step 2: Serve and verify the home screen**

Run: `npm start` and open `http://localhost:4200/#/home`.

Confirm each of these against the spec/screenshot:
- Nav: logo, links with red active underline on Calendar, search box, ☀/☾ toggle, avatar initials.
- Theme toggle flips light/dark instantly and survives a page refresh.
- Title row: eyebrow, "June *2026*" (year italic red), real release/anniversary counts.
- Prev/Next month and Today buttons change the grid; Month/Week toggle switches views; Day routes to the detail page.
- Filter chips open menus; selecting Genre/Rating/Decade/Bookmarks filters the cells and updates counts; active chips turn red; "Clear filters" appears only when a filter is active and resets everything.
- Grid: weekday headers (Sat/Sun red), today's cell red-tinted with red date number, up to 3 genre-colored pills per day, "+N more", day-click → `/detail/:date`.

- [ ] **Step 2a: Fix anything that does not match, then re-verify.**

- [ ] **Step 3: Final commit (only if fixes were made)**

```bash
git add -A
git commit -m "fix: calendar home redesign verification adjustments"
```

---

## Self-Review Notes

- **Spec coverage:** tokens (T4), fonts (T4), ThemeService + persistence + pre-paint (T3–T5), nav shell incl. search/toggle/avatar (T6), title row + real counts (T7–T8), filter chips wired to data (T7–T9), grid visuals + today + pills + "+N more" (T8–T9), week view restyle + Day routing (T7–T9), interactions (T7–T10). All spec sections map to a task.
- **Type consistency:** `genreBucket`/`genreColor`/`genreName` (T1) reused by `film-filter.ts` (T2) and component (T7); `CalendarFilters`/`DEFAULT_FILTERS`/`applyFilters` (T2) reused in T7; `ThemeService.current`/`setTheme`/`toggle`/`init` (T3) reused in T5–T7.
- **Logo asset:** uses the existing `Transparant profile_Tekengebied 1 - Copy.png`, inverted in dark mode (spec §9).
- **Open-menu dismissal:** menus close on selecting an option (sufficient for this step); a click-outside handler is a later polish item, not required by the spec.
