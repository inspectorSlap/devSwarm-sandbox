import { describe, expect, it } from 'vitest';
import {
  getOffsetMinutes,
  getZoneAbbreviation,
  zonedWallTimeToUtcInstant,
} from './core';

const NY = 'America/New_York';
const KOLKATA = 'Asia/Kolkata';

describe('spring-forward (America/New_York, 2025-03-09)', () => {
  // Clocks jump from 01:59:59 EST straight to 03:00:00 EDT at 07:00:00Z.
  const transitionInstant = Date.UTC(2025, 2, 9, 7, 0, 0);

  it('reports EST (-300) just before the transition', () => {
    const justBefore = transitionInstant - 1;
    expect(getOffsetMinutes(NY, justBefore)).toBe(-300);
    expect(getZoneAbbreviation(NY, justBefore)).toBe('EST');
  });

  it('reports EDT (-240) at/just after the transition', () => {
    expect(getOffsetMinutes(NY, transitionInstant)).toBe(-240);
    expect(getZoneAbbreviation(NY, transitionInstant)).toBe('EDT');
  });

  it('resolves a nonexistent wall-clock time (02:30) past the gap, as if it were 03:30 EDT', () => {
    const nonexistent = zonedWallTimeToUtcInstant(NY, {
      year: 2025,
      month: 3,
      day: 9,
      hour: 2,
      minute: 30,
    });
    const shifted = zonedWallTimeToUtcInstant(NY, {
      year: 2025,
      month: 3,
      day: 9,
      hour: 3,
      minute: 30,
    });
    expect(nonexistent).toBe(shifted);
    expect(getOffsetMinutes(NY, nonexistent)).toBe(-240);
  });

  it('round-trips a normal (non-transition) wall-clock time', () => {
    const instant = zonedWallTimeToUtcInstant(NY, {
      year: 2025,
      month: 3,
      day: 9,
      hour: 1,
      minute: 0,
    });
    expect(instant).toBe(Date.UTC(2025, 2, 9, 6, 0, 0));
  });
});

describe('fall-back (America/New_York, 2025-11-02)', () => {
  // Clocks fall from 01:59:59 EDT back to 01:00:00 EST at 06:00:00Z.
  const transitionInstant = Date.UTC(2025, 10, 2, 6, 0, 0);

  it('reports EDT (-240) just before the transition', () => {
    const justBefore = transitionInstant - 1;
    expect(getOffsetMinutes(NY, justBefore)).toBe(-240);
    expect(getZoneAbbreviation(NY, justBefore)).toBe('EDT');
  });

  it('reports EST (-300) at/just after the transition', () => {
    expect(getOffsetMinutes(NY, transitionInstant)).toBe(-300);
    expect(getZoneAbbreviation(NY, transitionInstant)).toBe('EST');
  });

  it('resolves an ambiguous wall-clock time (01:30) to the earlier (pre-transition) instant', () => {
    const resolved = zonedWallTimeToUtcInstant(NY, {
      year: 2025,
      month: 11,
      day: 2,
      hour: 1,
      minute: 30,
    });
    const earlyOccurrence = Date.UTC(2025, 10, 2, 5, 30, 0); // 01:30 EDT
    const lateOccurrence = Date.UTC(2025, 10, 2, 6, 30, 0); // 01:30 EST
    expect(resolved).toBe(earlyOccurrence);
    expect(resolved).toBeLessThan(lateOccurrence);
    expect(getOffsetMinutes(NY, resolved)).toBe(-240);
  });

  it('round-trips a normal (non-transition) wall-clock time', () => {
    const instant = zonedWallTimeToUtcInstant(NY, {
      year: 2025,
      month: 11,
      day: 2,
      hour: 3,
      minute: 0,
    });
    expect(instant).toBe(Date.UTC(2025, 10, 2, 8, 0, 0));
  });
});

describe('non-DST zone (Asia/Kolkata)', () => {
  it('returns a constant +330 minute offset year-round', () => {
    expect(getOffsetMinutes(KOLKATA, Date.UTC(2020, 0, 1))).toBe(330);
    expect(getOffsetMinutes(KOLKATA, Date.UTC(2020, 6, 1))).toBe(330);
    expect(getOffsetMinutes(KOLKATA, Date.UTC(1990, 0, 1))).toBe(330);
  });

  it('round-trips wall-clock conversion without ambiguity', () => {
    const instant = zonedWallTimeToUtcInstant(KOLKATA, {
      year: 2024,
      month: 6,
      day: 15,
      hour: 12,
      minute: 0,
    });
    expect(instant).toBe(Date.UTC(2024, 5, 15, 6, 30, 0));
  });
});

describe('instant is the source of truth', () => {
  it('derives wall-clock-equivalent offsets purely from the UTC instant', () => {
    const instant = Date.UTC(2025, 6, 1, 0, 0, 0);
    const offset1 = getOffsetMinutes(NY, instant);
    const offset2 = getOffsetMinutes(NY, instant);
    expect(offset1).toBe(offset2);
    expect(offset1).toBe(-240);
  });
});
