const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Normalize a `Date` or ISO date string to a UTC midnight timestamp
 * representing only the calendar date, discarding any time-of-day or
 * timezone skew.
 *
 * - A plain ISO date string (`'YYYY-MM-DD'`) is parsed as that exact
 *   calendar date, independent of the host timezone.
 * - Any other string is parsed with `Date`, then the *local* calendar
 *   date (year/month/day as the caller would read it on a wall clock)
 *   is used.
 * - A `Date` object is reduced to its local calendar date the same way.
 */
export function toUtcDateOnly(input: Date | string): Date {
  if (typeof input === 'string') {
    const match = ISO_DATE_ONLY.exec(input);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(Date.UTC(year, month - 1, day));
    }
    const parsed = new Date(input);
    return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
  }

  return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
}

/**
 * Number of whole days between two normalized UTC dates
 * (`targetDate - birthday`). Both arguments accept a `Date` or an ISO
 * date string. When `targetDate` is omitted, the caller's local "now"
 * is used, normalized the same way as any other input.
 */
export function dayCount(birthday: Date | string, targetDate: Date | string = new Date()): number {
  const start = toUtcDateOnly(birthday);
  const end = toUtcDateOnly(targetDate);
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

/**
 * Convert a normalized UTC date-only value (as produced by
 * {@link toUtcDateOnly}) back into a `Date` that reports the same
 * calendar date in the caller's local timezone.
 */
export function toLocalReportDate(utcDateOnly: Date): Date {
  return new Date(utcDateOnly.getUTCFullYear(), utcDateOnly.getUTCMonth(), utcDateOnly.getUTCDate());
}

/**
 * Return a new UTC date-only value `n` days after `utcDateOnly`.
 * `n` may be negative to move backward in time.
 */
export function addDays(utcDateOnly: Date, n: number): Date {
  return new Date(
    Date.UTC(utcDateOnly.getUTCFullYear(), utcDateOnly.getUTCMonth(), utcDateOnly.getUTCDate() + n),
  );
}
