import type { Ball, World } from './types';
import { stepBall } from './step';

/**
 * Runs `steps` physics steps starting from `ball`, returning the trajectory
 * (the Ball state after each step, in order). Deterministic and pure: does
 * not mutate `ball` and produces identical output for identical input.
 */
export function simulate(ball: Ball, world: World, dt: number, steps: number): Ball[] {
  const trajectory: Ball[] = [];
  let current = ball;

  for (let i = 0; i < steps; i += 1) {
    current = stepBall(current, world, dt);
    trajectory.push(current);
  }

  return trajectory;
}
