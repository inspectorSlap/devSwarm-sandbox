import { isEven } from '../../src/math/isEven';

describe('isEven', () => {
  it('qa-zero: returns true for 0', () => {
    expect(isEven(0)).toBe(true);
  });

  it('qa-pos-even: returns true for a positive even number', () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(2)).toBe(true);
  });

  it('qa-pos-odd: returns false for a positive odd number', () => {
    expect(isEven(7)).toBe(false);
    expect(isEven(1)).toBe(false);
  });

  it('qa-neg-even: returns true for a negative even number', () => {
    expect(isEven(-8)).toBe(true);
    expect(isEven(-2)).toBe(true);
  });

  it('qa-neg-odd: returns false for a negative odd number', () => {
    expect(isEven(-3)).toBe(false);
    expect(isEven(-1)).toBe(false);
  });

  it('qa-large: handles large numbers', () => {
    expect(isEven(1000000)).toBe(true);
    expect(isEven(1000001)).toBe(false);
  });
});
