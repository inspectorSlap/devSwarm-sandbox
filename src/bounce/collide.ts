import type { Ball, Bounds } from './types';

export function resolveWalls(ball: Ball, bounds: Bounds): Ball {
  const { pos, vel, radius, restitution } = ball;
  
  // Create new position and velocity objects
  const newPos = { x: pos.x, y: pos.y };
  const newVel = { x: vel.x, y: vel.y };
  
  // Check and resolve left/right wall collisions
  if (pos.x - radius < 0) {
    // Left wall collision
    newVel.x = -vel.x * restitution;
    newPos.x = radius;
  } else if (pos.x + radius > bounds.width) {
    // Right wall collision
    newVel.x = -vel.x * restitution;
    newPos.x = bounds.width - radius;
  }
  
  // Check and resolve top/bottom wall collisions
  if (pos.y - radius < 0) {
    // Top wall collision
    newVel.y = -vel.y * restitution;
    newPos.y = radius;
  } else if (pos.y + radius > bounds.height) {
    // Bottom wall collision
    newVel.y = -vel.y * restitution;
    newPos.y = bounds.height - radius;
  }
  
  // Return new ball with updated position and velocity
  return {
    pos: newPos,
    vel: newVel,
    radius,
    restitution
  };
}
