import { zonedWallTimeToUtcInstant, type WallClockParts } from './core';
import { formatInstant, type FormattedInstant } from './format';

export type ZonedTime = Pick<FormattedInstant, 'iso' | 'offsetMinutes' | 'abbreviation'>;

/** Returns the current day/time in `zoneId`, derived from the current UTC instant. */
export function getCurrentTimeInZone(zoneId: string): ZonedTime {
  return toZonedTime(Date.now(), zoneId);
}

/**
 * Projects a wall-clock date/time in `sourceZoneId` onto `targetZoneId`.
 * The source wall clock is first resolved to a UTC instant, which is then
 * rendered in the target zone (so date boundaries roll over as needed).
 */
export function getTimeInZoneAt(
  sourceZoneId: string,
  wallClockTime: WallClockParts,
  targetZoneId: string,
): ZonedTime {
  const instantMs = zonedWallTimeToUtcInstant(sourceZoneId, wallClockTime);
  return toZonedTime(instantMs, targetZoneId);
}

function toZonedTime(instantMs: number, zoneId: string): ZonedTime {
  const { iso, offsetMinutes, abbreviation } = formatInstant(instantMs, zoneId);
  return { iso, offsetMinutes, abbreviation };
}
