import type { Ball, World } from './types';

const REST_FLOOR_EPSILON = 1e-6;

/**
 * Advance a ball one physics step using semi-implicit (symplectic) Euler
 * integration: gravity updates velocity first, then the *new* velocity
 * updates position. Collisions against all four walls of the world box are
 * resolved the same step (reflect + clamp, so the ball cannot tunnel past a
 * wall), and a come-to-rest rule stops floor jitter once the ball is both
 * slow and resting on the floor.
 *
 * Pure: `ball` is never mutated; a new `Ball` is returned.
 */
export function stepBall(ball: Ball, world: World, dt: number): Ball {
  let vx = ball.vx;
  let vy = ball.vy + world.gravity * dt;

  let x = ball.x + vx * dt;
  let y = ball.y + vy * dt;

  const minX = ball.radius;
  const maxX = world.width - ball.radius;
  const minY = ball.radius;
  const maxY = world.height - ball.radius;

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

  const speed = Math.sqrt(vx * vx + vy * vy);
  const restingOnFloor = y >= maxY - REST_FLOOR_EPSILON;

  if (speed < world.restSpeed && restingOnFloor) {
    vx = 0;
    vy = 0;
  }

  return { x, y, vx, vy, radius: ball.radius };
}
