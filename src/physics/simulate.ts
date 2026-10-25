import { stepBall } from './step';
import type { Ball, World } from './types';

/**
 * Runs `steps` physics steps from `ball`, returning the trajectory (the
 * Ball state after each step, in order). Deterministic and pure: does not
 * mutate the initial ball, and produces identical output for identical
 * inputs.
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
