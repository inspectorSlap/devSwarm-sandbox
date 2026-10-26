import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentTimeInZone, getTimeInZoneAt } from './convert';

const AUCKLAND = 'Pacific/Auckland';
const LOS_ANGELES = 'America/Los_Angeles';
const KATHMANDU = 'Asia/Kathmandu';

describe('International Date Line day-rollover', () => {
  it('projecting from Auckland (far ahead of UTC) to Los Angeles rolls the calendar day backward', () => {
    const result = getTimeInZoneAt(
      AUCKLAND,
      { year: 2025, month: 1, day: 15, hour: 8, minute: 0 },
      LOS_ANGELES,
    );

    expect(result).toEqual({
      iso: '2025-01-14T11:00:00-08:00',
      offsetMinutes: -480,
      abbreviation: 'PST',
    });
  });

  it('projecting from Los Angeles to Auckland rolls the calendar day forward across the line', () => {
    const result = getTimeInZoneAt(
      LOS_ANGELES,
      { year: 2025, month: 1, day: 14, hour: 10, minute: 0 },
      AUCKLAND,
    );

    expect(result).toEqual({
      iso: '2025-01-15T07:00:00+13:00',
      offsetMinutes: 780,
      abbreviation: 'GMT+13',
    });
  });
});

describe('fractional UTC offset zone (Asia/Kathmandu, +5:45)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('computes the current time in a 45-minute-offset zone correctly', () => {
    vi.setSystemTime(Date.UTC(2025, 0, 14, 10, 15, 0));

    expect(getCurrentTimeInZone(KATHMANDU)).toEqual({
      iso: '2025-01-14T16:00:00+05:45',
      offsetMinutes: 345,
      abbreviation: 'GMT+5:45',
    });
  });
});

describe('invalid zone id handling', () => {
  it('getCurrentTimeInZone throws for an unrecognized zone rather than guessing an offset', () => {
    expect(() => getCurrentTimeInZone('Not/AZone')).toThrow();
  });

  it('getTimeInZoneAt throws when the source zone is unrecognized', () => {
    expect(() =>
      getTimeInZoneAt('Not/AZone', { year: 2025, month: 1, day: 1, hour: 0, minute: 0 }, 'UTC'),
    ).toThrow();
  });

  it('getTimeInZoneAt throws when the target zone is unrecognized', () => {
    expect(() =>
      getTimeInZoneAt('UTC', { year: 2025, month: 1, day: 1, hour: 0, minute: 0 }, 'Not/AZone'),
    ).toThrow();
  });
});
