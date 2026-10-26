import { describe, expect, it } from 'vitest';
import {
  FALLBACK_TIME_ZONES,
  UnknownTimeZoneError,
  getMachineTimeZone,
  listSupportedTimeZones,
  resolveZone,
} from './zones';

describe('resolveZone', () => {
  it('accepts a known IANA id and returns it unchanged', () => {
    expect(resolveZone('America/New_York')).toBe('America/New_York');
  });

  it('normalizes casing and surrounding whitespace', () => {
    expect(resolveZone('  america/new_york ')).toBe('America/New_York');
  });

  it('accepts the UTC alias, which the platform list omits', () => {
    expect(resolveZone('UTC')).toBe('UTC');
  });

  it('throws a typed UnknownTimeZoneError for an unknown zone id', () => {
    expect(() => resolveZone('Mars/Olympus_Mons')).toThrow(UnknownTimeZoneError);
    expect(() => resolveZone('')).toThrow(UnknownTimeZoneError);
  });

  it('reports the rejected input and error name on the thrown error', () => {
    let caught: unknown;
    try {
      resolveZone('Not/AZone');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(UnknownTimeZoneError);
    expect((caught as UnknownTimeZoneError).input).toBe('Not/AZone');
    expect((caught as UnknownTimeZoneError).name).toBe('UnknownTimeZoneError');
  });
});

describe('listSupportedTimeZones', () => {
  it('lists zones from the platform API and includes common ids', () => {
    const zones = listSupportedTimeZones();
    expect(zones.length).toBeGreaterThan(0);
    expect(zones).toContain('America/New_York');
  });

  it('every fallback zone is accepted by resolveZone', () => {
    for (const zone of FALLBACK_TIME_ZONES) {
      expect(() => resolveZone(zone)).not.toThrow();
    }
  });
});

describe('getMachineTimeZone', () => {
  it('returns the Intl-resolved local timezone', () => {
    expect(getMachineTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it('returns a zone that resolveZone accepts', () => {
    expect(resolveZone(getMachineTimeZone())).toBe(getMachineTimeZone());
  });
});
