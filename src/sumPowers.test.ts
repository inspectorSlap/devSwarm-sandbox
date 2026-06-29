import { describe, it, expect } from 'vitest';
import { sumPowers } from './sumPowers';

describe('sumPowers', () => {
  it('is defined', () => {
    expect(typeof sumPowers).toBe('function');
  });
});
