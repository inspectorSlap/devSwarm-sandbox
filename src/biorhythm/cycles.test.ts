import { describe, expect, it } from 'vitest';
import {
  classifyAlert,
  computeAllCycles,
  computePrimaryCycle,
  computeSecondaryCycle,
  toCycleResult,
} from './cycles';

describe('computePrimaryCycle', () => {
  it('matches sin(2*pi*t/period) for physical, emotional, intellectual periods', () => {
    for (const [t, period] of [
      [0, 23],
      [5, 23],
      [10, 28],
      [17, 33],
      [100, 33],
    ] as const) {
      expect(computePrimaryCycle(t, period)).toBeCloseTo(Math.sin((2 * Math.PI * t) / period), 12);
    }
  });

  it('computes the three primary cycles via computeAllCycles', () => {
    const t = 12345;
    const all = computeAllCycles(t);
    expect(all.physical.value).toBeCloseTo(Math.sin((2 * Math.PI * t) / 23), 12);
    expect(all.emotional.value).toBeCloseTo(Math.sin((2 * Math.PI * t) / 28), 12);
    expect(all.intellectual.value).toBeCloseTo(Math.sin((2 * Math.PI * t) / 33), 12);
  });
});

describe('computeSecondaryCycle', () => {
  it('is the exact average of its two primary values', () => {
    expect(computeSecondaryCycle(0.5, -0.25)).toBe(0.125);
    expect(computeSecondaryCycle(1, 1)).toBe(1);
  });

  it('passion/mastery/wisdom equal the average of their source primaries', () => {
    const t = 777;
    const all = computeAllCycles(t);
    expect(all.passion.value).toBe((all.physical.value + all.emotional.value) / 2);
    expect(all.mastery.value).toBe((all.physical.value + all.intellectual.value) / 2);
    expect(all.wisdom.value).toBe((all.emotional.value + all.intellectual.value) / 2);
  });
});

describe('classifyAlert', () => {
  it("classifies |value| >= 0.90 as 'peak'", () => {
    expect(classifyAlert(0.9)).toBe('peak');
    expect(classifyAlert(0.95)).toBe('peak');
    expect(classifyAlert(-0.9)).toBe('peak');
    expect(classifyAlert(-1)).toBe('peak');
  });

  it("classifies |value| <= 0.10 as 'critical'", () => {
    expect(classifyAlert(0.1)).toBe('critical');
    expect(classifyAlert(0)).toBe('critical');
    expect(classifyAlert(-0.1)).toBe('critical');
    expect(classifyAlert(-0.05)).toBe('critical');
  });

  it("classifies a mid-range value as 'none'", () => {
    expect(classifyAlert(0.5)).toBe('none');
    expect(classifyAlert(-0.5)).toBe('none');
    expect(classifyAlert(0.11)).toBe('none');
    expect(classifyAlert(0.89)).toBe('none');
  });
});

describe('toCycleResult', () => {
  it('keeps the raw value and rounds percent to the nearest whole number', () => {
    expect(toCycleResult(0.456)).toEqual({ value: 0.456, percent: 46, alert: 'none' });
    expect(toCycleResult(-0.734)).toEqual({ value: -0.734, percent: -73, alert: 'none' });
    expect(toCycleResult(0.9)).toEqual({ value: 0.9, percent: 90, alert: 'peak' });
    expect(toCycleResult(0.05)).toEqual({ value: 0.05, percent: 5, alert: 'critical' });
  });
});

describe('computeAllCycles', () => {
  it('returns all six entries keyed by CycleName', () => {
    const all = computeAllCycles(42);
    expect(Object.keys(all).sort()).toEqual(
      ['emotional', 'intellectual', 'mastery', 'passion', 'physical', 'wisdom'],
    );
    for (const entry of Object.values(all)) {
      expect(entry.value).toBeGreaterThanOrEqual(-1);
      expect(entry.value).toBeLessThanOrEqual(1);
    }
  });
});
