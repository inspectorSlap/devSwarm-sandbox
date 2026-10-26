import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WallClockParts } from './core';

const { machineTimeZone } = vi.hoisted(() => {
  return { machineTimeZone: vi.fn<() => string>(() => 'UTC') };
});

vi.mock('./zones', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./zones')>();
  return {
    ...actual,
    getMachineTimeZone: () => machineTimeZone(),
  };
});

const timezone = await import('./index');

function parseIsoWallClock(iso: string): WallClockParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso);
  if (!match) {
    throw new Error(`Unexpected ISO string: ${iso}`);
  }
  const [, year, month, day, hour, minute, second] = match as unknown as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };
}

describe('utcToLocal/localToUtc quick-convert round-trip with a mocked machine timezone', () => {
  afterEach(() => {
    machineTimeZone.mockReset();
    machineTimeZone.mockReturnValue('UTC');
  });

  it('round-trips through a fractional (+5:45) machine timezone', () => {
    machineTimeZone.mockReturnValue('Asia/Kathmandu');

    const instant = Date.UTC(2025, 0, 14, 10, 15, 0);
    const local = timezone.utcToLocal(instant);

    expect(local.iso).toBe('2025-01-14T16:00:00+05:45');
    expect(local.offsetMinutes).toBe(345);
    expect(timezone.localToUtc(parseIsoWallClock(local.iso))).toBe(instant);
  });

  it('round-trips across a Southern Hemisphere DST boundary machine timezone', () => {
    machineTimeZone.mockReturnValue('Australia/Sydney');

    // Just after the 2025-10-05 Sydney spring-forward transition (AEDT, +660).
    const instant = Date.UTC(2025, 9, 10, 4, 0, 0);
    const local = timezone.utcToLocal(instant);

    expect(local.offsetMinutes).toBe(660);
    expect(timezone.localToUtc(parseIsoWallClock(local.iso))).toBe(instant);
  });
});

describe('default-to-current-time behavior', () => {
  beforeEach(() => {
    machineTimeZone.mockReturnValue('Asia/Kolkata');
  });

  afterEach(() => {
    machineTimeZone.mockReset();
    machineTimeZone.mockReturnValue('UTC');
  });

  it('defaults utcToLocal and localToUtc to the current instant when called without arguments', () => {
    const before = Date.now();
    const local = timezone.utcToLocal();
    const utc = timezone.localToUtc();
    const after = Date.now();

    expect(utc).toBeGreaterThanOrEqual(before);
    expect(utc).toBeLessThanOrEqual(after);
    expect(local.iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    expect(local.offsetMinutes).toBe(330);
  });
});

describe('invalid zone id handling via the aggregated public API', () => {
  it('resolveZone throws a typed error for an unrecognized zone', () => {
    expect(() => timezone.resolveZone('Not/AZone')).toThrow(timezone.UnknownTimeZoneError);
  });

  it('getTimeDifference throws a typed error for an unrecognized zone', () => {
    expect(() => timezone.getTimeDifference('Not/AZone', 'UTC', Date.now())).toThrow(
      timezone.UnknownTimeZoneError,
    );
  });
});
