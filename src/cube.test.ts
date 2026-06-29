import { describe, it, expect } from 'vitest';
import { cube } from './cube';

describe('cube', () => {
  it('is defined', () => {
    expect(typeof cube).toBe('function');
  });

  it('cube(3) === 27', () => {
    expect(cube(3)).toBe(27);
  });
});
