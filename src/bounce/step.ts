import type { Vec2, Ball } from './types';

export function stepBall(ball: Ball, gravity: Vec2, dt: number): Ball {
  // Semi-implicit Euler integration: update velocity first, then position
  const newVelocity = {
    x: ball.vel.x + gravity.x * dt,
    y: ball.vel.y + gravity.y * dt
  };

  const newPosition = {
    x: ball.pos.x + newVelocity.x * dt,
    y: ball.pos.y + newVelocity.y * dt
  };

  // Return a new Ball object with the updated position and velocity
  // while preserving radius and restitution
  return {
    pos: newPosition,
    vel: newVelocity,
    radius: ball.radius,
    restitution: ball.restitution
  };
}
