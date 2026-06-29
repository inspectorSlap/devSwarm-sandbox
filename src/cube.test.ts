import { describe, it, expect } from 'vitest';
import { cube } from './cube';

describe('cube', () => {
  it('is defined', () => {
    expect(typeof cube).toBe('function');
  });
});
