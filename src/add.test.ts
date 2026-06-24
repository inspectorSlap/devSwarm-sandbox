import { describe, it, expect } from 'vitest';
import { add } from './add';

describe('add', () => {
  it('sums two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
