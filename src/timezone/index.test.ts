import { describe, expect, it } from 'vitest';
import type { WallClockParts } from './core';
import * as timezone from './index';

function parseIsoWallClock(iso: string): WallClockParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso);
  if (!match) {
    throw new Error(`Unexpected ISO string: ${iso}`);
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6]),
  };
}

describe('index-quick-convert', () => {
  it('utcToLocal and localToUtc round-trip an instant using the machine timezone', () => {
    const instant = Date.UTC(2025, 0, 15, 12, 34, 56);
    const local = timezone.utcToLocal(instant);
    expect(timezone.localToUtc(parseIsoWallClock(local.iso))).toBe(instant);
  });

  it('defaults both helpers to the current time when called without arguments', () => {
    const before = Date.now();
    const local = timezone.utcToLocal();
    const utc = timezone.localToUtc();
    const after = Date.now();
    expect(utc).toBeGreaterThanOrEqual(before);
    expect(utc).toBeLessThanOrEqual(after);
    expect(local.iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });
});

describe('index-exports', () => {
  it('exports all documented public functions from src/timezone/index.ts', () => {
    const documentedFunctions = [
      'getCurrentTimeInZone',
      'getTimeInZoneAt',
      'getOffsetMinutes',
      'getZoneAbbreviation',
      'zonedWallTimeToUtcInstant',
      'formatInstant',
      'getTimeDifference',
      'listSupportedTimeZones',
      'resolveZone',
      'getMachineTimeZone',
      'utcToLocal',
      'localToUtc',
    ] as const;

    for (const name of documentedFunctions) {
      expect(timezone[name], name).toBeTypeOf('function');
    }
  });

  it('exports the error class and fallback zone list', () => {
    expect(timezone.UnknownTimeZoneError).toBeTypeOf('function');
    expect(timezone.FALLBACK_TIME_ZONES).toBeInstanceOf(Array);
  });
});
