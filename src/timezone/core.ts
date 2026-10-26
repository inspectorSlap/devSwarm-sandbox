/**
 * Core timezone math.
 *
 * Everything here is anchored to a UTC epoch instant (milliseconds since
 * 1970-01-01T00:00:00Z). The instant is always the single source of truth;
 * any "wall clock" / local representation is *derived* from it via the
 * environment's IANA tzdata (through `Intl.DateTimeFormat`), never the other
 * way around. This means DST transition history for every zone is read from
 * the platform's tz database rather than hand-maintained tables, so it stays
 * correct as rules change.
 *
 * All functions in this module are pure (no I/O, no mutation of shared
 * state) and are the single source of truth for offset/DST math that other
 * modules in this codebase build on.
 */

/** Wall-clock (local) date/time parts, as you'd read off a clock in a zone. */
export interface WallClockParts {
  /** Full year, e.g. 2025. */
  year: number;
  /** Month, 1-12 (January is 1). */
  month: number;
  /** Day of month, 1-31. */
  day: number;
  /** Hour of day, 0-23. */
  hour: number;
  /** Minute, 0-59. */
  minute: number;
  /** Second, 0-59. Defaults to 0 when omitted. */
  second?: number;
  /** Millisecond, 0-999. Defaults to 0 when omitted. */
  millisecond?: number;
}

/** Window used to sample offsets "well away" from a potential DST edge. */
const HALF_DAY_MS = 12 * 60 * 60 * 1000;

function requirePart(parts: Intl.DateTimeFormatPart[], type: string): string {
  const found = parts.find((part) => part.type === type);
  if (!found) {
    throw new Error(`Intl.DateTimeFormat did not produce a "${type}" part`);
  }
  return found.value;
}

/**
 * Formats `instantMs` as if it were a UTC timestamp using the wall-clock
 * fields that `zoneId` would display at that instant, then returns that
 * reinterpreted value as milliseconds since epoch. The difference between
 * this value and `instantMs` is exactly the zone's UTC offset (in ms) at
 * that instant.
 */
function wallClockFieldsAsUtcMs(zoneId: string, instantMs: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zoneId,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(instantMs));

  const year = Number(requirePart(parts, 'year'));
  const month = Number(requirePart(parts, 'month'));
  const day = Number(requirePart(parts, 'day'));
  const hourRaw = Number(requirePart(parts, 'hour'));
  const hour = hourRaw === 24 ? 0 : hourRaw;
  const minute = Number(requirePart(parts, 'minute'));
  const second = Number(requirePart(parts, 'second'));

  return Date.UTC(year, month - 1, day, hour, minute, second);
}

/**
 * Returns the UTC offset, in minutes, of `zoneId` at the given UTC
 * `instantMs`. Positive values are east of UTC (e.g. +330 for
 * Asia/Kolkata), negative values are west of UTC (e.g. -240 for
 * America/New_York during EDT). Derived directly from the platform's tz
 * database via `Intl.DateTimeFormat`, so real historical/future DST
 * transitions are honored automatically.
 */
export function getOffsetMinutes(zoneId: string, instantMs: number): number {
  const asUtcMs = wallClockFieldsAsUtcMs(zoneId, instantMs);
  return Math.round((asUtcMs - instantMs) / 60_000);
}

/**
 * Returns the short zone name/abbreviation (e.g. "EST", "EDT", "CST",
 * "CDT") that is valid for `zoneId` at the given UTC `instantMs`. For zones
 * that lack a conventional abbreviation (e.g. Asia/Kolkata), falls back to
 * whatever short form `Intl` provides (e.g. "GMT+5:30").
 */
export function getZoneAbbreviation(zoneId: string, instantMs: number): string {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zoneId,
    timeZoneName: 'short',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(instantMs));
  return requirePart(parts, 'timeZoneName');
}

/**
 * Converts a local wall-clock date/time in `zoneId` to the UTC instant
 * (ms since epoch) it represents.
 *
 * DST edge-case policy (documented, deterministic):
 *  - Normal case: exactly one UTC instant maps to the given wall clock;
 *    that instant is returned.
 *  - Fall-back / ambiguous wall clock (a local time that occurs twice,
 *    e.g. 1:30 AM on the November DST-end date in America/New_York):
 *    resolves to the EARLIER of the two valid UTC instants, i.e. the
 *    occurrence under the pre-transition offset.
 *  - Spring-forward / nonexistent wall clock (a local time skipped by the
 *    clocks, e.g. 2:30 AM on the March DST-start date in
 *    America/New_York): resolves using the pre-transition offset, which
 *    is equivalent to shifting the requested wall clock forward past the
 *    gap into the post-transition offset (so 2:30 AM resolves the same as
 *    3:30 AM would).
 */
export function zonedWallTimeToUtcInstant(
  zoneId: string,
  wallClockParts: WallClockParts,
): number {
  const { year, month, day, hour, minute } = wallClockParts;
  const second = wallClockParts.second ?? 0;
  const millisecond = wallClockParts.millisecond ?? 0;

  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);

  const offsetWellBefore = getOffsetMinutes(zoneId, naiveUtcMs - HALF_DAY_MS);
  const offsetWellAfter = getOffsetMinutes(zoneId, naiveUtcMs + HALF_DAY_MS);

  if (offsetWellBefore === offsetWellAfter) {
    return naiveUtcMs - offsetWellBefore * 60_000;
  }

  const candidateBefore = naiveUtcMs - offsetWellBefore * 60_000;
  const candidateAfter = naiveUtcMs - offsetWellAfter * 60_000;

  const candidateBeforeValid = getOffsetMinutes(zoneId, candidateBefore) === offsetWellBefore;
  const candidateAfterValid = getOffsetMinutes(zoneId, candidateAfter) === offsetWellAfter;

  if (candidateBeforeValid && candidateAfterValid) {
    if (candidateBefore === candidateAfter) {
      return candidateBefore;
    }
    // Ambiguous (fall-back): pick the earlier UTC instant, deterministically.
    return Math.min(candidateBefore, candidateAfter);
  }

  if (candidateBeforeValid) {
    return candidateBefore;
  }
  if (candidateAfterValid) {
    return candidateAfter;
  }

  // Nonexistent (spring-forward gap): neither offset reproduces the
  // requested wall clock. Resolve using the pre-transition offset, which
  // lands past the gap at (wall clock + gap size).
  return candidateBefore;
}
