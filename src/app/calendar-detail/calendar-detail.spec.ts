import { getIsoWeek } from './calendar-detail.component';

describe('getIsoWeek', () => {
  it('returns week 1 for a Jan-1 Thursday (2026-01-01)', () => {
    expect(getIsoWeek(new Date(2026, 0, 1))).toBe(1);
  });

  it('returns week 23 for 2026-06-05 (matches the design)', () => {
    expect(getIsoWeek(new Date(2026, 5, 5))).toBe(23);
  });

  it('treats Monday as the start of the week', () => {
    // 2026-06-08 is the Monday of the following ISO week.
    expect(getIsoWeek(new Date(2026, 5, 8))).toBe(24);
  });
});
