import { describe, expect, it } from 'vitest';
import { getOffsetMinutes, getZoneAbbreviation, zonedWallTimeToUtcInstant } from './core';

const SYDNEY = 'Australia/Sydney';
const KATHMANDU = 'Asia/Kathmandu';

describe('Southern Hemisphere DST (Australia/Sydney, inverted schedule)', () => {
  describe('spring-forward on 2025-10-05 (Sydney moves clocks forward in October)', () => {
    // Clocks jump from 01:59:59 AEST straight to 03:00:00 AEDT at 2025-10-04T16:00:00Z.
    const transitionInstant = Date.UTC(2025, 9, 4, 16, 0, 0);

    it('reports standard time (+600, GMT+10) just before the transition', () => {
      const justBefore = transitionInstant - 1;
      expect(getOffsetMinutes(SYDNEY, justBefore)).toBe(600);
      expect(getZoneAbbreviation(SYDNEY, justBefore)).toBe('GMT+10');
    });

    it('reports daylight time (+660, GMT+11) at/after the transition', () => {
      expect(getOffsetMinutes(SYDNEY, transitionInstant)).toBe(660);
      expect(getZoneAbbreviation(SYDNEY, transitionInstant)).toBe('GMT+11');
    });

    it('resolves a nonexistent wall-clock time (02:30) past the gap, as if it were 03:30 AEDT', () => {
      const nonexistent = zonedWallTimeToUtcInstant(SYDNEY, {
        year: 2025,
        month: 10,
        day: 5,
        hour: 2,
        minute: 30,
      });
      const shifted = zonedWallTimeToUtcInstant(SYDNEY, {
        year: 2025,
        month: 10,
        day: 5,
        hour: 3,
        minute: 30,
      });
      expect(nonexistent).toBe(shifted);
      expect(getOffsetMinutes(SYDNEY, nonexistent)).toBe(660);
    });
  });

  describe('fall-back on 2025-04-06 (Sydney moves clocks back in April)', () => {
    // Clocks fall from 02:59:59 AEDT back to 02:00:00 AEST at 2025-04-05T16:00:00Z.
    const transitionInstant = Date.UTC(2025, 3, 5, 16, 0, 0);

    it('reports daylight time (+660, GMT+11) just before the transition', () => {
      const justBefore = transitionInstant - 1;
      expect(getOffsetMinutes(SYDNEY, justBefore)).toBe(660);
      expect(getZoneAbbreviation(SYDNEY, justBefore)).toBe('GMT+11');
    });

    it('reports standard time (+600, GMT+10) at/after the transition', () => {
      expect(getOffsetMinutes(SYDNEY, transitionInstant)).toBe(600);
      expect(getZoneAbbreviation(SYDNEY, transitionInstant)).toBe('GMT+10');
    });

    it('resolves an ambiguous wall-clock time (02:30) to the earlier (pre-transition) instant', () => {
      const resolved = zonedWallTimeToUtcInstant(SYDNEY, {
        year: 2025,
        month: 4,
        day: 6,
        hour: 2,
        minute: 30,
      });
      const earlyOccurrence = Date.UTC(2025, 3, 5, 15, 30, 0); // 02:30 AEDT
      const lateOccurrence = Date.UTC(2025, 3, 5, 16, 30, 0); // 02:30 AEST
      expect(resolved).toBe(earlyOccurrence);
      expect(resolved).toBeLessThan(lateOccurrence);
      expect(getOffsetMinutes(SYDNEY, resolved)).toBe(660);
    });
  });
});

describe('fractional UTC offset zone (Asia/Kathmandu, +5:45, no DST)', () => {
  it('returns a constant +345 minute offset year-round', () => {
    expect(getOffsetMinutes(KATHMANDU, Date.UTC(2025, 0, 14, 10, 15))).toBe(345);
    expect(getOffsetMinutes(KATHMANDU, Date.UTC(2025, 6, 1, 0, 0))).toBe(345);
    expect(getOffsetMinutes(KATHMANDU, Date.UTC(1990, 0, 1, 0, 0))).toBe(345);
  });

  it('reports the GMT+5:45 abbreviation', () => {
    expect(getZoneAbbreviation(KATHMANDU, Date.UTC(2025, 0, 14, 10, 15))).toBe('GMT+5:45');
  });

  it('round-trips a wall-clock time through the 45-minute offset without ambiguity', () => {
    const instant = zonedWallTimeToUtcInstant(KATHMANDU, {
      year: 2025,
      month: 1,
      day: 14,
      hour: 16,
      minute: 0,
    });
    expect(instant).toBe(Date.UTC(2025, 0, 14, 10, 15, 0));
  });
});

describe('invalid zone id handling', () => {
  it('throws rather than silently producing a wrong offset', () => {
    expect(() => getOffsetMinutes('Not/AZone', Date.now())).toThrow();
  });

  it('throws rather than silently producing a wrong abbreviation', () => {
    expect(() => getZoneAbbreviation('Not/AZone', Date.now())).toThrow();
  });

  it('throws rather than silently resolving a wrong instant', () => {
    expect(() =>
      zonedWallTimeToUtcInstant('Not/AZone', { year: 2025, month: 1, day: 1, hour: 0, minute: 0 }),
    ).toThrow();
  });
});
