import { getOffsetMinutes } from './core';
import { resolveZone } from './zones';

/**
 * Returns the signed UTC offset difference, in minutes, between two zones at
 * a UTC instant: `offset(zoneA) - offset(zoneB)`. Each zone's DST status is
 * evaluated independently at that instant. Zone ids are validated and
 * normalized via `resolveZone`, which throws `UnknownTimeZoneError` for
 * unrecognized input. `instant` is ms since epoch and defaults to now.
 */
export function getTimeDifference(
  zoneA: string,
  zoneB: string,
  instant: number = Date.now(),
): number {
  const canonicalA = resolveZone(zoneA);
  const canonicalB = resolveZone(zoneB);
  return getOffsetMinutes(canonicalA, instant) - getOffsetMinutes(canonicalB, instant);
}
