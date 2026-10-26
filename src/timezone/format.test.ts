import { describe, expect, it } from 'vitest';
import { formatInstant } from './format';

// 2025-01-14T21:45:00Z -> Tue 3:45 PM CST in America/Chicago (standard time)
const WINTER_INSTANT = Date.UTC(2025, 0, 14, 21, 45);
// 2025-07-14T21:45:00Z -> Mon 4:45 PM CDT in America/Chicago (daylight time)
const SUMMER_INSTANT = Date.UTC(2025, 6, 14, 21, 45);
// 2025-01-14T10:15:00Z -> Tue 3:45 PM in Asia/Kolkata (no DST, +05:30)
const KOLKATA_INSTANT = Date.UTC(2025, 0, 14, 10, 15);

describe('formatInstant human-readable string', () => {
  it('renders weekday, date, time, and abbreviation for a DST zone in standard time', () => {
    expect(formatInstant(WINTER_INSTANT, 'America/Chicago').formatted).toBe(
      'Tue, Jan 14 2025, 3:45 PM CST',
    );
  });

  it('renders the daylight-time abbreviation for a DST zone in summer', () => {
    expect(formatInstant(SUMMER_INSTANT, 'America/Chicago').formatted).toBe(
      'Mon, Jul 14 2025, 4:45 PM CDT',
    );
  });

  it('renders a non-DST zone with its fallback abbreviation', () => {
    expect(formatInstant(KOLKATA_INSTANT, 'Asia/Kolkata').formatted).toBe(
      'Tue, Jan 14 2025, 3:45 PM GMT+5:30',
    );
  });

  it('supports 24-hour output via hour12: false', () => {
    expect(formatInstant(WINTER_INSTANT, 'America/Chicago', { hour12: false }).formatted).toBe(
      'Tue, Jan 14 2025, 15:45 CST',
    );
  });

  it('renders midnight as 12 AM in 12-hour mode', () => {
    expect(formatInstant(Date.UTC(2025, 0, 14, 6, 5), 'America/Chicago').formatted).toBe(
      'Tue, Jan 14 2025, 12:05 AM CST',
    );
  });
});

describe('formatInstant structured parts', () => {
  it('returns ISO 8601 and negative offset minutes for a DST zone in standard time', () => {
    const result = formatInstant(WINTER_INSTANT, 'America/Chicago');
    expect(result.iso).toBe('2025-01-14T15:45:00-06:00');
    expect(result.offsetMinutes).toBe(-360);
    expect(result.abbreviation).toBe('CST');
    expect(result.weekday).toBe('Tuesday');
  });

  it('returns shifted ISO 8601 and offset for a DST zone in daylight time', () => {
    const result = formatInstant(SUMMER_INSTANT, 'America/Chicago');
    expect(result.iso).toBe('2025-07-14T16:45:00-05:00');
    expect(result.offsetMinutes).toBe(-300);
    expect(result.abbreviation).toBe('CDT');
    expect(result.weekday).toBe('Monday');
  });

  it('returns ISO 8601 and positive half-hour offset for a non-DST zone', () => {
    const result = formatInstant(KOLKATA_INSTANT, 'Asia/Kolkata');
    expect(result.iso).toBe('2025-01-14T15:45:00+05:30');
    expect(result.offsetMinutes).toBe(330);
    expect(result.weekday).toBe('Tuesday');
  });
});
