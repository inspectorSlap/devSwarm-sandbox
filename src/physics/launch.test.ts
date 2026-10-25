import { describe, expect, it } from 'vitest';
import { launchVelocity } from './launch';
import type { World } from './types';

const world: World = {
  width: 800,
  height: 600,
  gravity: 980,
  restitution: 0.8,
  maxSpeed: 1000,
  restSpeed: 5,
};

describe('launchVelocity', () => {
  it('launch-direction-opposite-drag: yields negative x for a drag pointing +x', () => {
    const v = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 0 }, 1, world);
    expect(v.x).toBeLessThan(0);
    expect(v.y).toBeCloseTo(0);
  });

  it('launch-power-scaling: doubling power roughly doubles speed, up to maxSpeed', () => {
    const slowWorld: World = { ...world, maxSpeed: 1_000_000 };
    const v1 = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 20 }, 1, slowWorld);
    const v2 = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 20 }, 2, slowWorld);
    const speed1 = Math.hypot(v1.x, v1.y);
    const speed2 = Math.hypot(v2.x, v2.y);
    expect(speed2).toBeCloseTo(speed1 * 2, 5);
  });

  it('launch-max-speed-clamp: large drag/power does not exceed world.maxSpeed', () => {
    const v = launchVelocity({ x: 0, y: 0 }, { x: 100_000, y: 100_000 }, 1000, world);
    const speed = Math.hypot(v.x, v.y);
    expect(speed).toBeLessThanOrEqual(world.maxSpeed + 1e-9);
  });

  it('launch-zero-drag: dragStart === dragEnd yields {x:0, y:0} without NaN', () => {
    const point = { x: 5, y: 5 };
    const v = launchVelocity(point, point, 1, world);
    expect(v).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(v.x)).toBe(false);
    expect(Number.isNaN(v.y)).toBe(false);
  });
});
