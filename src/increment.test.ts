import { describe, it, expect } from 'vitest';
import { increment } from './increment';

describe('increment', () => {
  it('is defined', () => {
    expect(typeof increment).toBe('function');
  });

  it('increment(5) === 6', () => {
    expect(increment(5)).toBe(6);
  });
});
