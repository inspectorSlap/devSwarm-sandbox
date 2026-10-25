import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

function draw(seed: number, n: number): number[] {
  const rand = createRng(seed);
  return Array.from({ length: n }, () => rand());
}

describe('createRng', () => {
  it('rng-determinism: same seed yields identical sequences', () => {
    expect(draw(42, 100)).toEqual(draw(42, 100));
  });

  it('rng-variation: different seeds yield different sequences', () => {
    expect(draw(1, 20)).not.toEqual(draw(2, 20));
  });

  it('produces values in [0, 1)', () => {
    for (const v of draw(7, 1000)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('qa-rng-negative-and-fractional-seeds: non-canonical seeds still produce finite, in-range, deterministic sequences', () => {
    for (const seed of [-1, -42, 3.7, -0]) {
      const values = draw(seed, 50);
      expect(draw(seed, 50)).toEqual(values);
      for (const v of values) {
        expect(Number.isNaN(v)).toBe(false);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    }
  });
});
