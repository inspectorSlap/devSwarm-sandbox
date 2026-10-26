import { describe, expect, it } from 'vitest';
import { formatInstant } from './format';

const SYDNEY = 'Australia/Sydney';
const KATHMANDU = 'Asia/Kathmandu';

describe('formatInstant across a Southern Hemisphere DST transition', () => {
  // Sydney spring-forward: 01:59:59 AEST (+600) -> 03:00:00 AEDT (+660) at 2025-10-04T16:00:00Z.
  const transitionInstant = Date.UTC(2025, 9, 4, 16, 0, 0);

  it('renders standard time just before the transition', () => {
    const result = formatInstant(transitionInstant - 60_000, SYDNEY);
    expect(result.offsetMinutes).toBe(600);
    expect(result.abbreviation).toBe('GMT+10');
    expect(result.iso).toBe('2025-10-05T01:59:00+10:00');
    expect(result.formatted).toBe('Sun, Oct 5 2025, 1:59 AM GMT+10');
  });

  it('renders daylight time at/after the transition', () => {
    const result = formatInstant(transitionInstant, SYDNEY);
    expect(result.offsetMinutes).toBe(660);
    expect(result.abbreviation).toBe('GMT+11');
    expect(result.iso).toBe('2025-10-05T03:00:00+11:00');
    expect(result.formatted).toBe('Sun, Oct 5 2025, 3:00 AM GMT+11');
  });
});

describe('formatInstant for a fractional UTC offset zone (Asia/Kathmandu, +5:45)', () => {
  it('computes and formats the 45-minute offset correctly', () => {
    const result = formatInstant(Date.UTC(2025, 0, 14, 10, 15), KATHMANDU);
    expect(result).toEqual({
      formatted: 'Tue, Jan 14 2025, 4:00 PM GMT+5:45',
      iso: '2025-01-14T16:00:00+05:45',
      offsetMinutes: 345,
      abbreviation: 'GMT+5:45',
      weekday: 'Tuesday',
    });
  });

  it('respects the hour12 option for the fractional-offset zone', () => {
    const result = formatInstant(Date.UTC(2025, 0, 14, 10, 15), KATHMANDU, { hour12: false });
    expect(result.formatted).toBe('Tue, Jan 14 2025, 16:00 GMT+5:45');
  });
});

describe('formatInstant invalid zone id handling', () => {
  it('throws rather than silently formatting with a wrong offset', () => {
    expect(() => formatInstant(Date.now(), 'Not/AZone')).toThrow();
  });
});
