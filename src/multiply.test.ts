import { describe, it, expect } from 'vitest';
import { multiply } from './multiply';

describe('multiply', () => {
  it('is defined', () => {
    expect(typeof multiply).toBe('function');
  });
});
