import { describe, expect, it } from 'vitest';
import {
  classifyAlert,
  computeAllCycles,
  computePrimaryCycle,
  computeSecondaryCycle,
  toCycleResult,
} from './cycles';

describe('computePrimaryCycle', () => {
  it('matches sin(2*pi*t/period) for physical, emotional and intellectual', () => {
    const all = computeAllCycles(10);
    expect(all.physical.value).toBeCloseTo(Math.sin((2 * Math.PI * 10) / 23), 12);
    expect(all.emotional.value).toBeCloseTo(Math.sin((2 * Math.PI * 10) / 28), 12);
    expect(all.intellectual.value).toBeCloseTo(Math.sin((2 * Math.PI * 10) / 33), 12);
    expect(computePrimaryCycle(-12, 33)).toBeCloseTo(Math.sin((2 * Math.PI * -12) / 33), 12);
  });
});

describe('computeSecondaryCycle', () => {
  it('equals the exact average of its two primary values', () => {
    const t = 9;
    const p = computePrimaryCycle(t, 23);
    const e = computePrimaryCycle(t, 28);
    const i = computePrimaryCycle(t, 33);
    const all = computeAllCycles(t);
    expect(all.passion.value).toBe(computeSecondaryCycle(p, e));
    expect(all.mastery.value).toBe(computeSecondaryCycle(p, i));
    expect(all.wisdom.value).toBe(computeSecondaryCycle(e, i));
  });
});

describe('classifyAlert', () => {
  it('returns peak at or beyond ±0.90', () => {
    expect(classifyAlert(0.9)).toBe('peak');
    expect(classifyAlert(1)).toBe('peak');
    expect(classifyAlert(-0.9)).toBe('peak');
    expect(classifyAlert(-1)).toBe('peak');
  });

  it('returns critical for |value| <= 0.10', () => {
    expect(classifyAlert(0.1)).toBe('critical');
    expect(classifyAlert(-0.1)).toBe('critical');
    expect(classifyAlert(0)).toBe('critical');
    expect(classifyAlert(0.05)).toBe('critical');
  });

  it('returns none for mid-range values', () => {
    expect(classifyAlert(0.5)).toBe('none');
    expect(classifyAlert(-0.5)).toBe('none');
    expect(classifyAlert(0.89)).toBe('none');
    expect(classifyAlert(0.11)).toBe('none');
  });
});

describe('toCycleResult', () => {
  it('rounds value*100 to the nearest whole percent', () => {
    expect(toCycleResult(0.456).percent).toBe(46);
    expect(toCycleResult(-0.374).percent).toBe(-37);
    expect(toCycleResult(0.5).percent).toBe(50);
  });

  it('carries the raw value and alert level', () => {
    expect(toCycleResult(0.95)).toEqual({ value: 0.95, percent: 95, alert: 'peak' });
    expect(toCycleResult(0.05)).toEqual({ value: 0.05, percent: 5, alert: 'critical' });
    expect(toCycleResult(0.5)).toEqual({ value: 0.5, percent: 50, alert: 'none' });
  });
});

describe('computeAllCycles', () => {
  it('returns all six cycle entries with alerts consistent with their values', () => {
    const all = computeAllCycles(3);
    expect(Object.keys(all).sort()).toEqual(
      ['emotional', 'intellectual', 'mastery', 'passion', 'physical', 'wisdom'],
    );
    for (const entry of Object.values(all)) {
      expect(entry.value).toBeGreaterThanOrEqual(-1);
      expect(entry.value).toBeLessThanOrEqual(1);
      expect(entry.alert).toBe(classifyAlert(entry.value));
    }
  });
});
