import type { Ball, World } from './types';
import { stepBall } from './step';

/**
 * Run `steps` physics steps starting from `ball`, returning the trajectory
 * (one `Ball` snapshot per step, in order). Deterministic and pure: the
 * input `ball` is never mutated, and identical inputs always yield an
 * identical (deep-equal) trajectory.
 */
export function simulate(ball: Ball, world: World, dt: number, steps: number): Ball[] {
  const trajectory: Ball[] = [];

  let current = ball;
  for (let i = 0; i < steps; i++) {
    current = stepBall(current, world, dt);
    trajectory.push(current);
  }

  return trajectory;
}
