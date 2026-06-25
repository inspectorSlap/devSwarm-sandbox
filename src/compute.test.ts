import { describe, it, expect } from 'vitest';
import { compute } from './compute';

describe('compute', () => {
  it('is defined', () => {
    expect(typeof compute).toBe('function');
  });

  it('computes a * b + 1', () => {
    expect(compute(3, 4)).toBe(13);
  });
});
