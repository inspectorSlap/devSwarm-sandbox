import { zonedWallTimeToUtcInstant, type WallClockParts } from './core';
import { formatInstant } from './format';
import type { ZonedTime } from './convert';
import { getMachineTimeZone } from './zones';

export * from './zones';
export * from './core';
export * from './format';
export * from './diff';
export * from './convert';

/** Renders a UTC instant (default: now) in the machine's local time zone. */
export function utcToLocal(instant = Date.now()): ZonedTime {
  return formatInstant(instant, getMachineTimeZone());
}

/**
 * Interprets a wall-clock time in the machine's local time zone and returns
 * its UTC instant in ms since epoch. Defaults to the current instant when omitted.
 */
export function localToUtc(localTime?: WallClockParts): number {
  if (localTime === undefined) {
    return Date.now();
  }
  return zonedWallTimeToUtcInstant(getMachineTimeZone(), localTime);
}
