import { describe, it, expect } from 'vitest';
import { sumPowers } from './sumPowers';

describe('sumPowers', () => {
  it('is defined', () => {
    expect(typeof sumPowers).toBe('function');
  });

  it('sums the square and cube of a number', () => {
    expect(sumPowers(2)).toBe(12);
  });
});
