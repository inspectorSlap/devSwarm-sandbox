import { describe, it, expect } from 'vitest';
import { subtract } from './subtract';

describe('subtract', () => {
  it('is defined', () => {
    expect(typeof subtract).toBe('function');
  });
});
