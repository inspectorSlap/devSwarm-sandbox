/**
 * IANA zone identifier resolution.
 *
 * This module only resolves and validates zone identifiers. It performs no
 * DST or UTC offset math; that lives in `./core`.
 */

/**
 * Common IANA zones used when `Intl.supportedValuesOf` is unavailable
 * (older runtimes). Not exhaustive; the full set is only available from the
 * platform API.
 */
export const FALLBACK_TIME_ZONES: readonly string[] = [
  'UTC',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'America/Sao_Paulo',
  'America/Toronto',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'Pacific/Auckland',
];

export class UnknownTimeZoneError extends Error {
  readonly input: string;

  constructor(input: string) {
    super(`Unknown IANA time zone: "${input}"`);
    this.name = 'UnknownTimeZoneError';
    this.input = input;
  }
}

/**
 * Returns the IANA zone IDs supported by the runtime, via
 * `Intl.supportedValuesOf('timeZone')`. Falls back to `FALLBACK_TIME_ZONES`
 * when that API is unavailable. The platform list omits aliases such as
 * `UTC`, so use `resolveZone` for validation.
 */
export function listSupportedTimeZones(): readonly string[] {
  if (typeof Intl.supportedValuesOf === 'function') {
    return Intl.supportedValuesOf('timeZone');
  }
  return FALLBACK_TIME_ZONES;
}

/**
 * Validates an IANA zone identifier and returns its canonical form
 * (surrounding whitespace trimmed, casing normalized, and aliases mapped to
 * the runtime's canonical name, e.g. `america/new_york` -> `America/New_York`,
 * `Asia/Kolkata` -> `Asia/Calcutta` on V8).
 *
 * @throws {UnknownTimeZoneError} if the input is not a recognized zone.
 */
export function resolveZone(input: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: input.trim() }).resolvedOptions().timeZone;
  } catch (error) {
    if (error instanceof RangeError) {
      throw new UnknownTimeZoneError(input);
    }
    throw error;
  }
}

/** Returns the requester's local IANA zone, e.g. `America/Chicago`. */
export function getMachineTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
