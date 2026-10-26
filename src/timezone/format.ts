import { getOffsetMinutes, getZoneAbbreviation } from './core';

export interface FormatOptions {
  /** Render the time as 12-hour with AM/PM. Defaults to true. */
  hour12?: boolean;
}

export interface FormattedInstant {
  /** Human-readable string, e.g. "Tue, Jan 14 2025, 3:45 PM CST". */
  formatted: string;
  /** ISO 8601 local date-time with offset, e.g. "2025-01-14T15:45:00-06:00". */
  iso: string;
  /** UTC offset in minutes at the instant (east of UTC positive). */
  offsetMinutes: number;
  /** Zone abbreviation at the instant, e.g. "CST". */
  abbreviation: string;
  /** English weekday name, e.g. "Tuesday". */
  weekday: string;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MINUTE_MS = 60_000;

function pad(value: number, width = 2): string {
  return String(value).padStart(width, '0');
}

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

function formatClock(hour24: number, minute: number, hour12: boolean): string {
  if (!hour12) {
    return `${pad(hour24)}:${pad(minute)}`;
  }
  const hour12Value = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12Value}:${pad(minute)} ${hour24 < 12 ? 'AM' : 'PM'}`;
}

/**
 * Formats a UTC epoch-ms `instantMs` as seen in `zoneId`. The offset and
 * abbreviation come from the core engine; this module only lays them out.
 */
export function formatInstant(
  instantMs: number,
  zoneId: string,
  opts: FormatOptions = {},
): FormattedInstant {
  const offsetMinutes = getOffsetMinutes(zoneId, instantMs);
  const abbreviation = getZoneAbbreviation(zoneId, instantMs);

  // Shifting by the core offset and reading UTC getters yields wall-clock fields.
  const wall = new Date(instantMs + offsetMinutes * MINUTE_MS);
  const year = wall.getUTCFullYear();
  const month = wall.getUTCMonth();
  const day = wall.getUTCDate();
  const hour24 = wall.getUTCHours();
  const minute = wall.getUTCMinutes();
  const second = wall.getUTCSeconds();
  const weekday = WEEKDAYS[wall.getUTCDay()] ?? '';

  const iso =
    `${pad(year, 4)}-${pad(month + 1)}-${pad(day)}T${pad(hour24)}:${pad(minute)}:${pad(second)}` +
    formatOffset(offsetMinutes);

  const clock = formatClock(hour24, minute, opts.hour12 ?? true);
  const formatted = `${weekday.slice(0, 3)}, ${MONTHS[month] ?? ''} ${day} ${year}, ${clock} ${abbreviation}`;

  return { formatted, iso, offsetMinutes, abbreviation, weekday };
}
