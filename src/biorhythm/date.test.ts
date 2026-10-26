import { describe, it, expect } from 'vitest';
import { toUtcDateOnly, dayCount, toLocalReportDate, addDays } from './date';

describe('date', () => {
  it('date-unit-daycount-basic: dayCount between two known dates returns the exact expected integer', () => {
    expect(dayCount('2024-01-01', '2024-01-31')).toBe(30);
    expect(dayCount('2024-01-31', '2024-01-01')).toBe(-30);
  });

  it('date-unit-iso-vs-date-equivalence: ISO string and equivalent Date object for the same calendar date produce identical dayCount results', () => {
    const isoBirthday = '1990-05-14';
    const dateBirthday = new Date(1990, 4, 14);
    const isoTarget = '2024-01-01';
    const dateTarget = new Date(2024, 0, 1);

    expect(dayCount(isoBirthday, isoTarget)).toBe(dayCount(dateBirthday, dateTarget));
    expect(dayCount(isoBirthday, dateTarget)).toBe(dayCount(dateBirthday, isoTarget));
  });

  it('date-unit-leap-day: dayCount correctly spans a Feb 29 leap day without off-by-one drift', () => {
    expect(dayCount('2024-02-28', '2024-03-01')).toBe(2);
    expect(dayCount('2024-02-01', '2024-03-01')).toBe(29);
  });

  it('date-unit-local-roundtrip: toLocalReportDate(toUtcDateOnly(input)) reports the same calendar date the caller supplied', () => {
    const input = new Date(2023, 10, 5);
    const roundTripped = toLocalReportDate(toUtcDateOnly(input));

    expect(roundTripped.getFullYear()).toBe(2023);
    expect(roundTripped.getMonth()).toBe(10);
    expect(roundTripped.getDate()).toBe(5);

    const isoInput = '2023-11-05';
    const roundTrippedIso = toLocalReportDate(toUtcDateOnly(isoInput));
    expect(roundTrippedIso.getFullYear()).toBe(2023);
    expect(roundTrippedIso.getMonth()).toBe(10);
    expect(roundTrippedIso.getDate()).toBe(5);
  });

  it('date-unit-add-days-negative: addDays with a negative n moves a UTC date-only value backward correctly', () => {
    const base = toUtcDateOnly('2024-03-01');
    const earlier = addDays(base, -1);

    expect(earlier.getUTCFullYear()).toBe(2024);
    expect(earlier.getUTCMonth()).toBe(1);
    expect(earlier.getUTCDate()).toBe(29);

    const muchEarlier = addDays(base, -30);
    expect(muchEarlier.getUTCFullYear()).toBe(2024);
    expect(muchEarlier.getUTCMonth()).toBe(0);
    expect(muchEarlier.getUTCDate()).toBe(31);
  });

  it('toUtcDateOnly discards time-of-day skew from the input', () => {
    const withTime = new Date(2024, 5, 15, 23, 59, 59, 999);
    const normalized = toUtcDateOnly(withTime);

    expect(normalized.getUTCFullYear()).toBe(2024);
    expect(normalized.getUTCMonth()).toBe(5);
    expect(normalized.getUTCDate()).toBe(15);
    expect(normalized.getUTCHours()).toBe(0);
    expect(normalized.getUTCMinutes()).toBe(0);
    expect(normalized.getUTCSeconds()).toBe(0);
    expect(normalized.getUTCMilliseconds()).toBe(0);
  });

  it('dayCount resolves "today" via local now when targetDate is omitted', () => {
    const now = new Date();
    expect(dayCount(now)).toBe(0);
    expect(dayCount(now)).toBe(dayCount(now, new Date()));
  });
});
