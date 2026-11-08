import { describe, it, expect } from 'vitest';
import { halve } from './halve';

describe('halve', () => {
  it('is defined', () => {
    expect(typeof halve).toBe('function');
  });

  it('halve(4) === 2', () => {
    expect(halve(4)).toBe(2);
  });

  it('halve(-4) === -2', () => {
    expect(halve(-4)).toBe(-2);
  });

  it('halve(0) === 0', () => {
    expect(halve(0)).toBe(0);
  });

  it('halve(3) === 1.5', () => {
    expect(halve(3)).toBe(1.5);
  });
});
