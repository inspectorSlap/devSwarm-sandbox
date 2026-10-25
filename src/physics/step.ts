import { square } from '../square';
import type { Ball, World } from './types';

const REST_EPSILON = 1e-9;

/**
 * Advances a ball by one timestep using semi-implicit (symplectic) Euler
 * integration: velocity is updated from gravity first, then position is
 * updated from the resulting velocity. Collisions against all four walls of
 * the world box are resolved (accounting for the ball radius), reflecting
 * the relevant velocity component scaled by `-world.restitution` and
 * clamping position back inside bounds. A ball resting on the floor with a
 * speed below `world.restSpeed` is brought fully to rest to avoid jitter.
 *
 * Pure: does not mutate `ball`, returns a new Ball.
 */
export function stepBall(ball: Ball, world: World, dt: number): Ball {
  const minX = ball.radius;
  const maxX = world.width - ball.radius;
  const minY = ball.radius;
  const maxY = world.height - ball.radius;

  const incomingSpeed = Math.sqrt(square(ball.vx) + square(ball.vy));
  const alreadyResting = ball.y >= maxY - REST_EPSILON && incomingSpeed < world.restSpeed;

  if (alreadyResting) {
    return { x: ball.x, y: maxY, vx: 0, vy: 0, radius: ball.radius };
  }

  let vx = ball.vx;
  let vy = ball.vy + world.gravity * dt;

  let x = ball.x + vx * dt;
  let y = ball.y + vy * dt;

  if (x < minX) {
    x = minX;
    vx = -vx * world.restitution;
  } else if (x > maxX) {
    x = maxX;
    vx = -vx * world.restitution;
  }

  if (y < minY) {
    y = minY;
    vy = -vy * world.restitution;
  } else if (y > maxY) {
    y = maxY;
    vy = -vy * world.restitution;
  }

  return { x, y, vx, vy, radius: ball.radius };
}
