import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getOffsetMinutes } from './core';
import { getCurrentTimeInZone, getTimeInZoneAt } from './convert';

describe('getCurrentTimeInZone', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('derives the current zone time from Date.now() using the core offset engine', () => {
    const nowMs = Date.UTC(2025, 6, 1, 12, 0, 0);
    vi.setSystemTime(nowMs);

    const result = getCurrentTimeInZone('America/New_York');

    expect(result.offsetMinutes).toBe(getOffsetMinutes('America/New_York', Date.now()));
    expect(result.offsetMinutes).toBe(-240);
    expect(result.abbreviation).toBe('EDT');
    expect(result.iso).toBe('2025-07-01T08:00:00-04:00');
  });
});

describe('getTimeInZoneAt', () => {
  it('projects a wall-clock time across zones with a forward date rollover', () => {
    const result = getTimeInZoneAt(
      'America/New_York',
      { year: 2025, month: 1, day: 14, hour: 23, minute: 30 },
      'Asia/Tokyo',
    );

    expect(result).toEqual({
      iso: '2025-01-15T13:30:00+09:00',
      offsetMinutes: 540,
      abbreviation: 'GMT+9',
    });
  });

  it('projects a wall-clock time across zones with a backward date rollover', () => {
    const result = getTimeInZoneAt(
      'Asia/Tokyo',
      { year: 2025, month: 3, day: 1, hour: 6, minute: 15 },
      'America/Los_Angeles',
    );

    expect(result).toEqual({
      iso: '2025-02-28T13:15:00-08:00',
      offsetMinutes: -480,
      abbreviation: 'PST',
    });
  });
});
