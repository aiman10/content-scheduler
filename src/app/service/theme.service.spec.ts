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
