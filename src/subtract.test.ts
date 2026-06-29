import { describe, it, expect } from 'vitest';
import { subtract } from './subtract';

describe('subtract', () => {
  it('is defined', () => {
    expect(typeof subtract).toBe('function');
  });

  it('subtracts two numbers', () => {
    expect(subtract(10, 4)).toBe(6);
  });
});
