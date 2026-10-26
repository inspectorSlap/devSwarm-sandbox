import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTimeDifference } from './diff';
import { UnknownTimeZoneError } from './zones';

const NY = 'America/New_York';
const LONDON = 'Europe/London';

describe('getTimeDifference', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults to the current machine time when instant is omitted', () => {
    const now = Date.UTC(2025, 6, 1, 12, 0, 0);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);

    // July: New York is EDT (-240), London is BST (+60).
    expect(getTimeDifference(NY, LONDON)).toBe(-300);
    expect(getTimeDifference(NY, LONDON)).toBe(getTimeDifference(NY, LONDON, now));
  });

  it('reflects only the zone that transitions across a DST boundary', () => {
    // US DST begins 2025-03-09 07:00Z; UK DST does not begin until 2025-03-30.
    const justBefore = Date.UTC(2025, 2, 9, 6, 59, 59);
    const atTransition = Date.UTC(2025, 2, 9, 7, 0, 0);

    expect(getTimeDifference(NY, LONDON, justBefore)).toBe(-300);
    expect(getTimeDifference(NY, LONDON, atTransition)).toBe(-240);
  });

  it('shifts again when only the other zone transitions', () => {
    // UK DST begins 2025-03-30 01:00Z; NY is already on EDT.
    const justBefore = Date.UTC(2025, 2, 30, 0, 59, 59);
    const atTransition = Date.UTC(2025, 2, 30, 1, 0, 0);

    expect(getTimeDifference(NY, LONDON, justBefore)).toBe(-240);
    expect(getTimeDifference(NY, LONDON, atTransition)).toBe(-300);
  });

  it('normalizes zone ids through the zone registry', () => {
    const instant = Date.UTC(2025, 6, 1, 12, 0, 0);
    expect(getTimeDifference(' america/new_york ', 'europe/london', instant)).toBe(-300);
  });

  it('rejects unknown zone ids', () => {
    const instant = Date.UTC(2025, 6, 1, 12, 0, 0);
    expect(() => getTimeDifference('Not/AZone', LONDON, instant)).toThrow(UnknownTimeZoneError);
    expect(() => getTimeDifference(NY, 'Not/AZone', instant)).toThrow(UnknownTimeZoneError);
  });
});
