import type { AlertLevel, CycleName, CycleResult } from './types';

const PERIOD_DAYS = {
  physical: 23,
  emotional: 28,
  intellectual: 33,
} as const;

const PEAK_THRESHOLD = 0.9;
const CRITICAL_THRESHOLD = 0.1;

export function computePrimaryCycle(t: number, periodDays: number): number {
  return Math.sin((2 * Math.PI * t) / periodDays);
}

export function computeSecondaryCycle(a: number, b: number): number {
  return (a + b) / 2;
}

export function classifyAlert(value: number): AlertLevel {
  const magnitude = Math.abs(value);
  if (magnitude >= PEAK_THRESHOLD) return 'peak';
  if (magnitude <= CRITICAL_THRESHOLD) return 'critical';
  return 'none';
}

export function toCycleResult(value: number): CycleResult {
  return {
    value,
    percent: Math.round(value * 100),
    alert: classifyAlert(value),
  };
}

export function computeAllCycles(t: number): Record<CycleName, CycleResult> {
  const physical = computePrimaryCycle(t, PERIOD_DAYS.physical);
  const emotional = computePrimaryCycle(t, PERIOD_DAYS.emotional);
  const intellectual = computePrimaryCycle(t, PERIOD_DAYS.intellectual);

  return {
    physical: toCycleResult(physical),
    emotional: toCycleResult(emotional),
    intellectual: toCycleResult(intellectual),
    passion: toCycleResult(computeSecondaryCycle(physical, emotional)),
    mastery: toCycleResult(computeSecondaryCycle(physical, intellectual)),
    wisdom: toCycleResult(computeSecondaryCycle(emotional, intellectual)),
  };
}
