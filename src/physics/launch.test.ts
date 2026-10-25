import { describe, expect, it } from 'vitest';
import { launchVelocity } from './launch';
import type { World } from './types';

const world: World = {
  width: 800,
  height: 600,
  gravity: 980,
  restitution: 0.7,
  maxSpeed: 2000,
  restSpeed: 5,
};

describe('launchVelocity', () => {
  it('launch-direction-opposite-drag: opposite the drag vector', () => {
    const v = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 0 }, 1, world);
    expect(v.x).toBeLessThan(0);
  });

  it('launch-power-scaling: doubling power roughly doubles speed below the clamp', () => {
    const v1 = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 0 }, 1, world);
    const v2 = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 0 }, 2, world);
    const speed1 = Math.hypot(v1.x, v1.y);
    const speed2 = Math.hypot(v2.x, v2.y);
    expect(speed2).toBeCloseTo(speed1 * 2, 5);
  });

  it('launch-max-speed-clamp: never exceeds world.maxSpeed', () => {
    const v = launchVelocity({ x: 0, y: 0 }, { x: 100000, y: 100000 }, 1000, world);
    const speed = Math.hypot(v.x, v.y);
    expect(speed).toBeLessThanOrEqual(world.maxSpeed + 1e-9);
  });

  it('launch-zero-drag: zero-length drag yields {x:0, y:0} without NaN', () => {
    const v = launchVelocity({ x: 5, y: 5 }, { x: 5, y: 5 }, 1, world);
    expect(v).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(v.x)).toBe(false);
    expect(Number.isNaN(v.y)).toBe(false);
  });
});
