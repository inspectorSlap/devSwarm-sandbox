import { describe, expect, it } from 'vitest';
import { getBiorhythm } from './index';
import { PRIMARY_PERIODS } from './cycles';
import { dayCount } from './date';
import type { CycleName } from './types';

const ALL_KEYS: CycleName[] = ['physical', 'emotional', 'intellectual', 'passion', 'mastery', 'wisdom'];
const DAY_MS = 24 * 60 * 60 * 1000;

function localIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addIsoDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

describe('getBiorhythm single date', () => {
  it('returns all six cycles with correct value, percent and alert for a known pair', () => {
    const result = getBiorhythm('2000-01-01', { targetDate: '2000-01-11' });

    expect(result.t).toBe(10);
    expect(result.date).toBe('2000-01-11');
    expect(Object.keys(result).sort()).toEqual([...ALL_KEYS, 'date', 't'].sort());

    const physical = Math.sin((2 * Math.PI * 10) / PRIMARY_PERIODS.physical);
    expect(result.physical.value).toBeCloseTo(physical, 12);
    expect(result.physical.percent).toBe(Math.round(physical * 100));
    expect(result.physical.alert).toBe('none');

    const emotional = Math.sin((2 * Math.PI * 10) / PRIMARY_PERIODS.emotional);
    expect(result.passion.value).toBeCloseTo((physical + emotional) / 2, 12);
  });

  it('flags peak and critical alerts from the shared thresholds', () => {
    const result = getBiorhythm('2000-01-01', { targetDate: '2000-01-01' });
    expect(result.t).toBe(0);
    expect(result.physical.alert).toBe('critical');
    expect(result.emotional.alert).toBe('critical');
    expect(result.intellectual.alert).toBe('critical');
  });

  it('returns only the requested cycles when mode is set', () => {
    const result = getBiorhythm('2000-01-01', { targetDate: '2000-01-11', mode: ['physical'] });
    expect(Object.keys(result).sort()).toEqual(['date', 'physical', 't']);
    expect(result.physical.value).toBeCloseTo(
      Math.sin((2 * Math.PI * 10) / PRIMARY_PERIODS.physical),
      12,
    );
  });

  it('accepts Date objects and ISO strings interchangeably', () => {
    const fromString = getBiorhythm('1990-05-14', { targetDate: '2024-01-01' });
    const fromDate = getBiorhythm(new Date(1990, 4, 14), { targetDate: new Date(2024, 0, 1) });
    expect(fromDate).toEqual(fromString);
    expect(fromString.t).toBe(dayCount('1990-05-14', '2024-01-01'));
  });

  it('resolves the target to today in local time when targetDate is omitted', () => {
    const result = getBiorhythm('2000-01-01');
    expect(result.date).toBe(localIso(new Date()));
    expect(result.t).toBe(dayCount('2000-01-01', localIso(new Date())));
  });

  it('throws a clear error for invalid birthday or targetDate', () => {
    expect(() => getBiorhythm('not-a-date')).toThrow(/Invalid birthday/);
    expect(() => getBiorhythm(new Date('garbage'))).toThrow(/Invalid birthday/);
    expect(() => getBiorhythm('2000-01-01', { targetDate: 'nope' })).toThrow(/Invalid targetDate/);
    expect(() => getBiorhythm('2000-01-01', { targetDate: new Date(NaN) })).toThrow(
      /Invalid targetDate/,
    );
    expect(() => getBiorhythm(undefined as unknown as string)).toThrow(/birthday is required/);
  });
});

describe('getBiorhythm periods', () => {
  it('period day returns exactly one entry starting at targetDate', () => {
    const results = getBiorhythm('2000-01-01', { targetDate: '2000-03-01', period: 'day' });
    expect(results.map((r) => r.date)).toEqual(['2000-03-01']);
  });

  it('period week returns 7 chronological entries starting at targetDate', () => {
    const results = getBiorhythm('2000-01-01', { targetDate: '2000-02-27', period: 'week' });
    expect(results).toHaveLength(7);
    expect(results.map((r) => r.date)).toEqual(
      Array.from({ length: 7 }, (_, i) => addIsoDays('2000-02-27', i)),
    );
    expect(results.map((r) => r.t)).toEqual(
      results.map((_, i) => dayCount('2000-01-01', addIsoDays('2000-02-27', i))),
    );
  });

  it('period month returns 30 chronological entries starting at targetDate', () => {
    const results = getBiorhythm('2000-01-01', { targetDate: '2000-02-20', period: 'month' });
    expect(results).toHaveLength(30);
    expect(results[0]?.date).toBe('2000-02-20');
    expect(results[29]?.date).toBe('2000-03-20');
  });

  it('backfill week prepends the 7 preceding days in chronological order', () => {
    const results = getBiorhythm('2000-01-01', {
      targetDate: '2000-03-03',
      period: 'week',
      backfill: true,
    });
    expect(results).toHaveLength(14);
    expect(results.map((r) => r.date)).toEqual(
      Array.from({ length: 14 }, (_, i) => addIsoDays('2000-03-03', i - 7)),
    );
  });

  it('backfill month prepends 30 preceding days', () => {
    const results = getBiorhythm('2000-01-01', {
      targetDate: '2000-03-01',
      period: 'month',
      backfill: true,
    });
    expect(results).toHaveLength(60);
    expect(results[0]?.date).toBe(addIsoDays('2000-03-01', -30));
    expect(results[30]?.date).toBe('2000-03-01');
  });

  it('applies mode filter to every entry in period results', () => {
    const results = getBiorhythm('2000-01-01', {
      targetDate: '2000-03-01',
      period: 'week',
      mode: ['wisdom'],
    });
    expect(results).toHaveLength(7);
    for (const r of results) {
      expect(Object.keys(r).sort()).toEqual(['date', 't', 'wisdom']);
    }
  });

  it('keeps consecutive days exactly one day apart across a leap day', () => {
    const results = getBiorhythm('2000-01-01', {
      targetDate: '2024-02-26',
      period: 'week',
      backfill: true,
    });
    for (let i = 1; i < results.length; i++) {
      const prev = Date.parse(`${results[i - 1]?.date}T00:00:00Z`);
      const cur = Date.parse(`${results[i]?.date}T00:00:00Z`);
      expect(cur - prev).toBe(DAY_MS);
    }
  });
});
