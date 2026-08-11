import { getIsoWeek, toIsoDate, MONTH_NAMES, WEEKDAY_NAMES } from './date-utils';

describe('date-utils', () => {
  it('getIsoWeek returns week 1 for a Jan-1 Thursday (2026-01-01)', () => {
    expect(getIsoWeek(new Date(2026, 0, 1))).toBe(1);
  });

  it('getIsoWeek returns week 23 for 2026-06-04 (matches the design)', () => {
    expect(getIsoWeek(new Date(2026, 5, 4))).toBe(23);
  });

  it('toIsoDate zero-pads month and day', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toIsoDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('toIsoDate stays on the local date, not UTC', () => {
    // 23:30 local would roll back a day if this went through toISOString().
    expect(toIsoDate(new Date(2026, 5, 4, 23, 30))).toBe('2026-06-04');
  });

  it('has 12 month names and 7 weekday names', () => {
    expect(MONTH_NAMES.length).toBe(12);
    expect(WEEKDAY_NAMES.length).toBe(7);
    expect(MONTH_NAMES[5]).toBe('June');
    expect(WEEKDAY_NAMES[4]).toBe('Thursday');
  });
});
