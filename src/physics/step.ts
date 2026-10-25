import type { Ball, World } from './types';

const REST_EPSILON = 1e-6;

/**
 * Advances a ball by one timestep using semi-implicit (symplectic) Euler
 * integration, resolves wall collisions against the four bounds of the
 * world box, and settles the ball to rest once it is slow enough and
 * touching the floor. Does not mutate `ball`; returns a new Ball.
 */
export function stepBall(ball: Ball, world: World, dt: number): Ball {
  const { radius } = ball;
  const { width, height, gravity, restitution, restSpeed } = world;

  let vx = ball.vx;
  let vy = ball.vy + gravity * dt;

  let x = ball.x + vx * dt;
  let y = ball.y + vy * dt;

  if (x - radius < 0) {
    x = radius;
    vx = -vx * restitution;
  }
  if (x + radius > width) {
    x = width - radius;
    vx = -vx * restitution;
  }
  if (y - radius < 0) {
    y = radius;
    vy = -vy * restitution;
  }
  if (y + radius > height) {
    y = height - radius;
    vy = -vy * restitution;
  }

  const speed = Math.hypot(vx, vy);
  const touchingFloor = y + radius >= height - REST_EPSILON;
  if (speed < restSpeed && touchingFloor) {
    vx = 0;
    vy = 0;
  }

  return { x, y, vx, vy, radius };
}
