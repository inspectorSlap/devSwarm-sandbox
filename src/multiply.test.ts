import { describe, it, expect } from 'vitest';
import { multiply } from './multiply';

describe('multiply', () => {
  it('is defined', () => {
    expect(typeof multiply).toBe('function');
  });

  it('multiply(3, 4) === 12', () => {
    expect(multiply(3, 4)).toBe(12);
  });
});
