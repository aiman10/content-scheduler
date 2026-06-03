# Film Enthusiast — Calendar Home Redesign (Step 1)

**Date:** 2026-06-03
**Scope:** Global design-token foundation + nav shell + Calendar month view ("home screen").
**Design source:** `README.md` ("Modern Minimal" handoff) + reference screenshot.

This is the first step of a full-app redesign. It establishes the shared visual
foundation (tokens, fonts, theming, nav shell) that every later screen reuses, then
delivers the redesigned Calendar month view with all controls functional.

---

## 1. Goals & Non-Goals

### Goals
- Introduce the "Modern Minimal" design-token system (light + dark) without breaking
  pages still on Bulma.
- Rebuild the **nav shell** to the new design.
- Rebuild the **Calendar month view** to the new design, wired to real data.
- Make every visible control functional: filters, month nav, Today, view toggle,
  theme toggle, day-click, search (restyled, existing behavior).

### Non-Goals (deferred to later steps)
- Redesigning Movies / Bookmarked / Awards / Cast & Crew screens (stay on Bulma for now).
- Fetching *all* monthly releases from TMDB ("184 releases" density). Calendar continues
  to show the user's **bookmarked films** on their release anniversary.
- A standalone "Day" calendar view (the "Day" segment routes to the existing detail page).
- Removing Bulma (retires gradually as each screen is converted).

---

## 2. Architecture & Approach

**Layer design tokens on top of Bulma.** Bulma stays loaded for un-redesigned pages.
Redesigned components (`navbar`, `calendar`) use *only* the new CSS custom properties.

- Tokens live in `src/styles.css`, scoped under `:root[data-theme="light"]` and
  `:root[data-theme="dark"]`.
- Theme is controlled by a `data-theme` attribute on the `<html>` element.
- A new `ThemeService` owns theme state, persistence, and DOM attribute updates.
- An inline script in `index.html` sets the initial `data-theme` from `localStorage`
  before first paint to prevent a flash of the wrong theme.

**Rejected alternatives:** removing Bulma now (breaks 3 live pages); adding Tailwind
(disproportionate tooling change for a visual redesign).

---

## 3. Design Tokens

Added to `src/styles.css`. Values from README.

### Light (`:root[data-theme="light"]`)
| Var | Value |
|---|---|
| `--bg` | `#FAF8F4` |
| `--surface` | `#FFFFFF` |
| `--elev` | `#FDFBF7` |
| `--border` | `#E8E2D6` |
| `--border-strong` | `#D6CDBB` |
| `--text` | `#1A1815` |
| `--text-muted` | `#5C544A` |
| `--muted` | `#A09689` |
| `--red` | `#B53428` |
| `--red-ink` | `#8C2A21` |
| `--red-soft` | `#FBEDEA` |

### Dark (`:root[data-theme="dark"]`)
| Var | Value |
|---|---|
| `--bg` | `#141210` |
| `--surface` | `#1C1916` |
| `--elev` | `#221E1A` |
| `--border` | `#2E2A24` |
| `--border-strong` | `#3B362E` |
| `--text` | `#F1E9DD` |
| `--text-muted` | `#A89E8E` |
| `--muted` | `#6E6557` |
| `--red` | `#E04A3A` |
| `--red-ink` | `#F26A5A` |
| `--red-soft` | `rgba(224,74,58,0.13)` |

### Typography & fonts
Load via `index.html` `<link>`:
- Newsreader: `ital,wght@0,400;0,500;0,600;1,400;1,500`
- Inter: `wght@400;500;600;700`
- JetBrains Mono: `wght@400;500;600`

Font-family vars: `--font-serif: 'Newsreader'`, `--font-ui: 'Inter'`, `--font-mono: 'JetBrains Mono'`.
Type roles per README (h1 56–64px Newsreader, h2 26px, h3 20px, body Inter 13px,
day-header labels Inter 11px/600/0.06em, metadata JetBrains Mono).

### Genre dot colors (`src/app/genres.ts`)
A map of TMDB `genre_id` → `{ name, color }`. README defines 8 design genres with oklch
colors; TMDB has 19 genres. Mapping rule:
- The 8 named buckets get README's exact oklch (lightness `0.62` light / `0.68` dark, via
  a `[data-theme] .pill-bar` lightness override or two oklch values).
- Remaining TMDB genres map to the nearest bucket (e.g. Thriller/Crime/War→Action hue,
  Animation→Family, Documentary/History→Classic, Music/Mystery/Western→Drama/Comedy).
Full mapping table is implemented in `genres.ts`; the design accepts "nearest reasonable
hue" for the long tail.

| Bucket | L | C | H |
|---|---|---|---|
| Action | 0.62 | 0.16 | 12 |
| Comedy | 0.62 | 0.16 | 50 |
| Drama | 0.62 | 0.16 | 270 |
| Romance | 0.62 | 0.16 | 350 |
| Horror | 0.62 | 0.16 | 150 |
| Sci-Fi | 0.62 | 0.16 | 220 |
| Family | 0.62 | 0.16 | 180 |
| Classic | 0.62 | 0.16 | 80 |

### Spacing tokens
`--page-x: 48px`, `--nav-height: 72px`, `--card-radius: 12px`, `--chip-radius: 999px`,
`--cell-min-h: 132px`, `--cell-pad: 12px`. Global 200ms ease transition on
`background-color, color, border-color`.

---

## 4. ThemeService

`src/app/service/theme.service.ts`
- State: current theme (`'light' | 'dark'`), default `'light'`.
- `init()`: read `localStorage['fe-theme']`; fall back to `'light'`; apply to `<html>`.
- `toggle()` / `setTheme(t)`: update state, write `localStorage`, set
  `document.documentElement.setAttribute('data-theme', t)`.
- Exposes the current theme for the nav toggle's active-segment state.

`index.html` inline head script (pre-paint, mirrors the service default):
```html
<script>
  (function () {
    var t = localStorage.getItem('fe-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

---

## 5. Nav Shell (`navbar` component)

Full-width bar, `height: var(--nav-height)`, `padding: 0 40px`, `background: var(--surface)`,
bottom `1px solid var(--border)`. Flex row, vertically centered.

- **Left:** logo `img` (`src/assets/Transparant profile_Tekengebied 1 - Copy.png`, height 38px),
  `filter: invert(1)` under `[data-theme="dark"]`; right border divider + `margin-right: 32px`.
- **Links:** Calendar · Movies · Cast & Crew · Bookmarked · Awards. Inter 13px/500,
  color `--text-muted`. Active = `--text` + `2px solid var(--red)` bottom border via
  Angular `routerLinkActive`.
  - Calendar → `/home`; Cast & Crew → `/castcrew`; Bookmarked → `/bookmarked`; Awards → `/awards`.
  - **Movies** has no route yet → rendered as a non-routing placeholder link (no active state)
    until that screen is built.
- **Right:** search input (280px, radius 8, `--bg` bg, `--border` border) keeping the
  existing live-search dropdown behavior, restyled; `☀ / ☾` segmented theme toggle
  (radius 8, padding 3px, active segment on `--bg` tint); 32px avatar circle showing the
  user's initials derived from the Auth0 `user` profile (name/email), fallback "?".
- Logout: keep current Auth0 logout, restyled or moved into an avatar affordance
  (kept as an accessible button; minimal restyle).

Mobile: existing burger behavior retained, restyled to tokens.

---

## 6. Calendar Month View (`calendar` component)

Routes: `/home` (and `/`). Day click → `/detail/:date` (unchanged).

### 6.1 Title row (`padding: 40px 48px 24px`)
- Eyebrow "RELEASE CALENDAR" — Inter 12px/500, `--muted`, `letter-spacing: .04em`.
- `<h1>` `{{ monthName }} <i>{{ year }}</i>` — Newsreader 56–64px/400, year italic `--red`.
- Subtitle — Inter 13px `--text-muted`, **real counts**: total bookmarked films releasing
  this month and anniversary count. Copy: `"{N} releases · {B} anniversaries you've bookmarked"`
  computed from the loaded data for the visible month.
- Right cluster: prev / next month buttons (34×34, radius 8, border); **Today** button
  (padding 8×16, radius 8); divider; **Month / Week / Day** segmented control.

### 6.2 Filter row (`padding: 0 48px 20px`)
Flex row, `gap: 8px`. Pill chips (radius 999, padding 7×12, Inter 12px/500).
Inactive: `--surface` bg / `--border` / `--text`. Active: `--red-soft` / `--red` / `--red-ink`.

| Chip | Behavior (against loaded bookmarked films) |
|---|---|
| **Genre** | Dropdown of genres present in the data; filters cells by `genre_ids`. "All" = no filter. |
| **Rating** | Threshold on `vote_average` (e.g. All / ≥ 6 / ≥ 7 / ≥ 8). |
| **Decade** | Threshold on release year decade derived from `release_date`; options built from data. |
| **Bookmarks** | "Show all" vs "Bookmarked only" (`isBookmarked`). |
| **Clear filters** | Text link (`--muted`); resets all chips to defaults. |

Filtering is applied in the component before `getMoviesForDay` slicing, so pills,
"+N more", and subtitle counts all reflect the active filters.

### 6.3 Grid (`padding: 0 48px 40px`)
Container `background: var(--surface)`, `border: 1px solid var(--border)`,
`border-radius: 12px`, `overflow: hidden`.

- **Header row:** 7-col grid, each `padding: 12px 14px`, Inter 11px/600 `--text-muted`,
  `letter-spacing: .06em`; Sat + Sun columns `--red`; right border between columns.
- **Day cells:** 35 cells (existing `weeks` generation, Monday-first — already implemented).
  Each: `padding: 12px`, `min-height: 132px`, right + bottom `1px solid var(--border)`.
  - Background `--surface`; **today** `--red-soft`; out-of-month days (the `0` placeholders /
    adjacent-month numbers) dimmed `opacity: .45`.
  - Date number: Newsreader 18px/500 `--text`; today `--red`.
  - Up to 3 pills: flex row gap 6px; left `3×14px` bar with genre color (`border-radius:1px`);
    title Inter 12px/500 `--text`, truncated with ellipsis.
  - Overflow "+N more": Inter 11px/500 `--muted`, `margin-top: 3px`.
  - Hover tooltip listing the day's full set is retained (restyled) OR replaced by relying on
    day-click navigation — **decision: keep the existing hover tooltip, restyled to tokens.**

### 6.4 Week view
Restyled to tokens (same cell visual language, taller cells, prev/next week nav as today).
"Day" segment routes to `/detail/:date` for the currently `selectedDate`.

---

## 7. Interactions (all functional this step)

| Interaction | Behavior |
|---|---|
| Genre / Rating / Decade / Bookmarks chips | Filter visible films; active chip styling; recompute counts |
| Clear filters | Reset chips to defaults |
| Prev / Next month | Adjust `selectedMonth/Year`, regenerate grid |
| Today | Jump to current month, today's cell highlighted |
| Month / Week / Day | Month↔Week toggle; Day → detail page |
| Day click | Navigate `/detail/YYYY-MM-DD` |
| Theme toggle ☀/☾ | Toggle + persist to `localStorage`, update `<html data-theme>` |
| Search | Existing live TMDB search + dropdown, restyled |
| Bookmark pulse / chip transitions | Per README animation notes (scale pulse 150ms; 150ms chip transition; 200ms theme transition) |

---

## 8. Affected / New Files

**New**
- `src/app/service/theme.service.ts`
- `src/app/genres.ts`

**Modified**
- `src/index.html` (fonts + pre-paint theme script + title)
- `src/styles.css` (tokens, base type, transitions)
- `src/app/navbar/navbar.component.{html,css,ts}`
- `src/app/calendar/calendar.component.{html,css,ts}`
- `src/app/app.component.ts` (init ThemeService) — or init within nav; minimal.

No backend, routing-table, or data-model changes.

---

## 9. Risks & Notes

- **Logo asset:** README names `assets/logo-black.png`; actual file is
  `Transparant profile_Tekengebied 1 - Copy.png`. Use the existing file; invert in dark mode.
  If it is not a clean wordmark, revisit (possible fallback: render "Film Enthusiast." as
  styled Newsreader text).
- **Genre long-tail mapping** is approximate (nearest hue) — acceptable for visual dots.
- **Bulma coexistence:** redesigned components must avoid Bulma classes to prevent style
  bleed; verify nav/calendar render identically with Bulma still globally loaded.
- **oklch support:** modern browsers only; fine for this app's audience. Fallback not required.
