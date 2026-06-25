import { describe, it, expect } from 'vitest';
import { compute } from './compute';

describe('compute', () => {
  it('is defined', () => {
    expect(typeof compute).toBe('function');
  });

  it('compute(3, 4) === 13', () => {
    expect(compute(3, 4)).toBe(13);
  });
});
