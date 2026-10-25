import { describe, expect, it } from 'vitest';
import { launchVelocity } from './launch';
import type { World } from './types';

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    width: 800,
    height: 600,
    gravity: 980,
    restitution: 0.7,
    maxSpeed: 2000,
    restSpeed: 5,
    ...overrides,
  };
}

describe('launchVelocity', () => {
  it('launch-direction-opposite-drag: fires opposite the drag vector', () => {
    const world = makeWorld();
    const result = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 0 }, 1, world);
    expect(result.x).toBeLessThan(0);
  });

  it('launch-power-scaling: doubling power roughly doubles speed, up to the clamp', () => {
    const world = makeWorld({ maxSpeed: 100_000 });
    const low = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 5 }, 1, world);
    const high = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 5 }, 2, world);

    const lowSpeed = Math.hypot(low.x, low.y);
    const highSpeed = Math.hypot(high.x, high.y);

    expect(highSpeed).toBeCloseTo(lowSpeed * 2, 5);
  });

  it('launch-max-speed-clamp: clamps magnitude to world.maxSpeed', () => {
    const world = makeWorld({ maxSpeed: 500 });
    const result = launchVelocity({ x: 0, y: 0 }, { x: 1_000_000, y: 1_000_000 }, 1_000_000, world);
    const speed = Math.hypot(result.x, result.y);
    expect(speed).toBeLessThanOrEqual(world.maxSpeed + 1e-9);
  });

  it('launch-zero-drag: zero-length drag yields {x:0, y:0} without NaN', () => {
    const world = makeWorld();
    const point = { x: 42, y: 17 };
    const result = launchVelocity(point, point, 1, world);
    expect(result).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(result.x)).toBe(false);
    expect(Number.isNaN(result.y)).toBe(false);
  });
});
