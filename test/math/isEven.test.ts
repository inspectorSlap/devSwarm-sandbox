import { describe, it, expect } from 'vitest';
import { isEven } from '../../src/math/isEven';

describe('isEven', () => {
  it('qa-zero: isEven(0) === true', () => {
    expect(isEven(0)).toBe(true);
  });

  it('qa-pos-even: isEven(4) === true', () => {
    expect(isEven(4)).toBe(true);
  });

  it('qa-pos-odd: isEven(7) === false', () => {
    expect(isEven(7)).toBe(false);
  });

  it('qa-neg-even: isEven(-8) === true', () => {
    expect(isEven(-8)).toBe(true);
  });

  it('qa-neg-odd: isEven(-3) === false', () => {
    expect(isEven(-3)).toBe(false);
  });

  it('qa-large: isEven(1000000) === true', () => {
    expect(isEven(1000000)).toBe(true);
  });
});

