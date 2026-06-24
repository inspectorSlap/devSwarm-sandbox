import { describe, it, expect } from 'vitest';
import { increment } from './increment';

describe('increment', () => {
  it('is defined', () => {
    expect(typeof increment).toBe('function');
  });
});
