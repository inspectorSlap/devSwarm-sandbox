import { describe, it, expect } from 'vitest';
import { square } from './square';

describe('square', () => {
  it('is defined', () => {
    expect(typeof square).toBe('function');
  });

  it('square(3) === 9', () => {
    expect(square(3)).toBe(9);
  });
});
